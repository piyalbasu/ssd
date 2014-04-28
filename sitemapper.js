/* jshint node: true */

var url = require('url'),
  q = require('q'),
  request = require('request'),
  cheerio = require('cheerio'),

Sitemapper = function(baseUrl) {
  'use strict';

  var self = this,

    /**
     * Parsed passed URL
     */
    href = url.parse(baseUrl),

    /**
     * Current host for our site
     */
    siteHost = href.host,

    /**
     * A base path from passed URL to handle relative links.
     */
    basePath,

    /**
     * Array of URLs that have already been crawled.
     */
    siteStack = [],

    /**
     * Array of URLs to crawl.
     */
    queue = [
      baseUrl
    ],

    /**
     * Array of URLs currently crawling
     */
    crawling = [],

    /**
     * Flag that indicates if we're currently crawling or not.
     */
    running = false,

    /**
     * Stores setInterval ID
     */
    intervalId,

    /**
     * A promise.
     */
    deferred = q.defer(),

    isRunning = function() {
      /* Privileged vars: crawling, intervalId, running, deferred */
      if (0 === crawling.length) {
        clearInterval(intervalId);
        running = false;
        deferred.resolve(siteStack);
      }
    },

    /**
     * Remove default pages from paths
     */
    getBasePath = function(path) {
      // TODO: Handle more than index.html
      return path.replace('index.html', '');
    },

    /**
     * Give it a URL or URL fragment and attempt to normalize
     */
    parsePath = function(path) {
      var l;
      if (path) {
        l = path.length;
        // If it ends in a slash, give it the default page
        if (path.substring(l - 1, l) === '/') {
          path += 'index.html';
        }
        if (path.substring(0, 2) === './') {
          path = basePath + getBasePath(path.substring(2, l)) +
              'index.html';
        }
        // If the path doesn't begin with a slash, make sure it does
        if (path.substring(0, 1) !== '/') {
          path = basePath + path;
        }
      }
      return path;
    },

    /**
     * Look for crummy links (#, javascript, etc.)
     */
    badLink = function(href) {
      var ret = false;
      if (href.substring(0, 1) === '#') {
        ret = true;
      }
      if (href.substring(0, 11) === 'javascript:') {
        ret = true;
      }
      if (href.match('Authenticate.aspx')) {
        ret = true;
      }

      if (href.substring(href.length - 4) === '.pdf') {
        ret = true;
      }

      return ret;
    },

    handleLinks = function($) {
      /* Privileged vars: siteHost */
      $('a').each(function() {
        var href = $(this).attr('href'),
          host,
          cleanPath,
          fullUrl,
          failLink;
        if (null !== href && typeof href !== 'undefined') {
//console.log('Logging ' + href);
          href = url.parse(href);
          host = href.host;
          cleanPath = parsePath(href.path);
          fullUrl = 'http://' + siteHost + cleanPath;
          failLink = badLink(href.href);
          // We have a local link that is good...
          if ((host === null || host === siteHost) &&
              failLink === false) {
/*if (cleanPath === null) {
  console.log('null');
  console.log(href);
}*/
            // and that hasn't been crawled...
            if (siteStack.indexOf(fullUrl) === -1) {
              // Store path
              siteStack.push(fullUrl);
              // Add full URL to queue
              queue.push(fullUrl);
              // Call our crawler
              self.crawl();
            }
          }
        }
      });
    },

    /**
     * Take data from request, turn it into a DOM and call utility functions
     */
    handlePage = function(data) {
      var $ = cheerio.load(data);
      handleLinks($);
    };

  // Set a base path from our passed URL to handle relative links.
  basePath = getBasePath(href.path);
  // Add the passed URL path to site stack of paths.
  siteStack.push('http://' + siteHost + parsePath(href.path));

  this.crawl = function() {
    /* Privileged vars: queue, crawling, running, intervalId, deferred */
    var requestUrl,
      index;
    // Do we have pages to crawl?
    if (queue.length > 0) {
      requestUrl = queue[0];
      // Remove item from to crawl queue.
      queue.splice(0, 1);
      // Add item to crawling queue.
      crawling.push(requestUrl);
      // Make the request
//console.log('Requesting ' + requestUrl);
      request(requestUrl, function(error, response, body) {
//console.log('Response URL: ' + response.request.uri.href);
        // Remove from crawling queue
//console.log(crawling);
        index = crawling.indexOf(response.request.uri.href);
        crawling.splice(index, 1);
//console.log(crawling);
        if (!error && response.statusCode === 200) {
          // Pass returned HTML to utility functions
          handlePage(body);
        }
      });
      // TODO: Not this. Start polling. :(
      if (false === running) {
        running = true;
        intervalId = setInterval(isRunning, 500);
        return deferred.promise;
      }
    }
  };

  this.getMap = function() {
    /* Privileged vars: siteStack */
    return siteStack;
  };

};

module.exports = Sitemapper;
