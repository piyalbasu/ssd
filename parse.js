/* jshint node: true */

var jsdom = require('jsdom'),
	countInArray,
	getData,
	parse,
	pathTrim,
	content = {
		js: []
	},
	global = [];

pathTrim = function(input) {
	return input.substring(input.lastIndexOf('/'))
}

countInArray = function(array, what) {
    var count = 0;
    for (var i = 0; i < array.length; i++) {
        if (array[i] === what) {
            count++;
        }
    }
    return count;
}


parse = function(url) {
	jsdom.env(
		url, ['http://code.jquery.com/jquery.js'],
		function(errors, window) {

			//this guy will parse the dom for what we're looking for
			getJs = function(type, attr, arrayType) {
				var $ = window.$;
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

			getMeta = function(type, url) {
				var $ = window.$,
					title,
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

			getImg = function(type, url) {
				var $ = window.$,
					imgArray = content[url]['img'],
					src;
				$(type).each(function() {
					src = $(this).attr('src');
					var filename = pathTrim(src).slice(1);
					//figure out if this is a global image, bc we don't want none of that
					global.push(filename);
					//Occurs more than once? I guess?...we'll come back
					//Also, maybe this should happen at the end of the loop, just go through & trim all globals...this is fine for demo for now
					if (countInArray(global, filename) < 2) {
						imgArray.push(filename);
					}
				});
			};

			//let's grab some stuff
			getJs('script', 'src', content.js);
			getMeta('meta', url);
			getImg('img', url);
			//We're done...grab the array
			console.log(content);

		}
	);
}

var urlArray =
	[
	'http://www.cialis.com/',
	'http://www.cialis.com/about-ed-and-bph.aspx'
];


for (var i = urlArray.length - 1; i >= 0; i--) {
	parse(urlArray[i]);

};
