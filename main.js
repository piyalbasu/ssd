/* jshint node: true */

var cli = require('./ssd-cli'),
	Sitemapper = require('./sitemapper');

cli.getSite( function(){
	sitemapper = new Sitemapper(cli.siteName);
	sitemapper.crawl().then(function(siteUrls) {
		console.log('Sitemapper URL array: [' +
		siteUrls.toString() + ']');
	});
});


