var jsdom = require('jsdom');

function parse(url, callback) {
	jsdom.env(
		url, ['http://code.jquery.com/jquery.js'],
		function(errors, window) {
			var $ = window.$;

			//this guy will parse the dom for script tags
			function getJs(type, attr, arrayType) {
				$(type).each(function() {
					var filesource = $(this).attr(attr);
					if (filesource) {
						var filename = pathTrim(filesource).slice(1);
						if (arrayType.indexOf(filename) === -1) {
							arrayType.push(filename);
						}
					}
				});
			};

			function getCss(type, attr, arrayType, callback) {
				$(type).each(function() {
					var filesource = $(this).attr(attr);
					if ($(this).attr('type') === 'text/css') {
						//var filename = pathTrim(filesource).slice(1);
						if (arrayType.indexOf(filesource) === -1) {
							arrayType.push(filesource);
						}
					}
				});
				callback();
			};

			function getMeta(type, url) {
				var title,
					description;
				$(type).each(function() {
					if ($(this).attr('name') === 'title') {
						title = $(this).attr('content');
					}

					if ($(this).attr('name') === 'description') {
						description = $(this).attr('content');
					}
					content[url] = {
						meta : {
						'title' : title,
						'description' : description
						},
						img : []
					};
				});
			};

			function getImg(type, url) {
				var imgArray = content[url]['img'],
					src;
				$(type).each(function() {
					src = $(this).attr('src');
					var filename = pathTrim(src).slice(1);
					//figure out if this is a global image, bc we don't want none of that
					global.push(filename);
					//Occurs more than once? I guess?...we'll come back
					//This takes care of every array besides the first, because on the first array, the globals haven't been set yet...we come back and clean up the first array with cleanFirstArray at the end
					if (countInArray(global, filename) < 2) {
						imgArray.push(filename);
					}
				});
			};

			//let's grab some stuff
			getJs('script', 'src', content.js);
			getCss('link', 'href', content.css, function(){
				parseCss(content.css[0]);

			});
			getMeta('meta', url);
			getImg('img', url);

			callback();

		}
	);
}

module.exports.parse = parse;
