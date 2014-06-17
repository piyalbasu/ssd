/* jshint node: true */

var jsdom = require('jsdom'),
	countInArray,
	content = {
		js: [],
		css: []
	},
	global = [];

function pathTrim(input) {
	return input.substring(input.lastIndexOf('/'))
}

function countInArray(array, what) {
    var count = 0;
    for (var i = 0; i < array.length; i++) {
        if (array[i] === what) {
            count++;
        }
    }
    return count;
}


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

function getIndicesOf(searchStr, str, caseSensitive) {
    var startIndex = 0, searchStrLen = searchStr.length;
    var index, indices = [];
    if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}

function parseCss(url) {
	var stylesheet = urlArray[0]+url;
	jsdom.env(
		stylesheet, ['http://code.jquery.com/jquery.js'],
		function(errors, window) {
			var $ = window.$;
			var body = $('body').text();
			//var trimBody = body.replace(/\/\*(.*)*\/$/g, '');
			var result = body.match(/url\((.*)\)/g);
			var styleArray = body.split('}');
			var cleanArray = [];

			for (var i = styleArray.length - 1; i >= 0; i--) {


				if(styleArray[i].indexOf('url(') > 0){
					cleanArray.push(styleArray[i]);
				}

				if( i === 0){
					imgPairs();
				}
				// console.log(styleArray[i]);
			};

			function imgPairs() {
				for (var i = cleanArray.length - 1; i >= 0; i--) {
					//matches id and the img...getting closer!
					console.log(cleanArray[i].match(/#(.*) /g), cleanArray[i].match(/url\((.*)\)/g));
				};
			}

	});
};

var urlArray =
	[
	'http://www.cialis.com/',
	'http://www.cialis.com/about-ed-and-bph.aspx'
];


//callback when loop is over...this is nifty
function urlToParse(i) {
	if( i < urlArray.length){
		parse(urlArray[i], function(){
			urlToParse(i + 1);
		});
	}
	else {
		//whaddya got for me?
		//console.log(content);
		cleanFirstArray(0);
	}
}

urlToParse(0);


function cleanFirstArray(i) {
	var firstImgArray = content[urlArray[0]]['img'];
	if ( i < firstImgArray.length) {
		if (firstImgArray.indexOf(global[i]) > -1 ) {
				firstImgArray.splice(global[i], firstImgArray.indexOf(global[i]));
			}
			cleanFirstArray(i +1);
	}
	else {
		console.log(content);
	}
}
