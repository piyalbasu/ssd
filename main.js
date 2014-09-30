/* jshint node: true */

var cli = require('./ssd-cli'),
	Sitemapper = require('./sitemapper'),
	parse = require('./parse'),
	siteName;


cli.getSite( function(){

	sitemapper = new Sitemapper('http://' + cli.siteName);
	sitemapper.crawl().then(function(siteUrls) {
		console.log(typeof siteUrls);
		parse.urlToParse(0, siteUrls, cli.siteName);
		cli.exit();
		// //console.log('Sitemapper URL array: [' +
		// siteUrls.toString() + ']');
	});
});

module.exports.siteName = siteName;

