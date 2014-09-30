var jsdom = require('jsdom'),
	globalArr = [],
	parseContent = {
		js: [],
		css: []
	},
	bgImg = require('./bgImg'),
	tempSelArray;

function pathTrim(input) {
	return input.substring(input.lastIndexOf('/'))
}

// function parseCss(url) {
// 	 console.log(bgImg.imgSelectors);
// 	// if (bgImg.imgSelectors) {
// 	// 	for (var i = tempSelArray.length - 1; i >= 0; i--) {
// 	// 		if (bgImg.imgUrlSelectors.indexOf(tempSelArray[i]) < 0){
// 	// 			//imgUrlSelectors.push(tempSelArray[i]);
// 	// 		}

// 	// 		if (i === 0) {
// 	// 			//console.log(tempSelArray);
// 	// 		}
// 	// 	};
// 	// }
// };

function countInArray(array, what) {
    var count = 0;
    for (var i = 0; i < array.length; i++) {
        if (array[i] === what) {
            count++;
        }
    }
    return count;
}

function parse(url, sitename, callback) {

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
					parseContent[url] = {
						meta : {
						'title' : title,
						'description' : description
						},
						img : []
					};
				});
			};

			function getImg(type, url) {
				var imgArray = parseContent[url]['img'],
					src;
				$(type).each(function() {
					src = $(this).attr('src');
					var filename = pathTrim(src).slice(1);
					//figure out if this is a global image, bc we don't want none of that
					globalArr.push(filename);
					//Occurs more than once? I guess?...we'll come back
					//This takes care of every array besides the first, because on the first array, the globals haven't been set yet...we come back and clean up the first array with cleanFirstArray at the end
					if (countInArray(globalArr, filename) < 2) {
						imgArray.push(filename);
					}
				});
			};

			function getBgImg() {
				for(i = 0; i < parseContent.css.length; i++) {
					bgImg.init(sitename, parseContent.css[i]);
				}

				for(property in bgImg.imgSelectors){
					var sel = property.replace(':hover', '');
					if($(sel)) {
						var parseContentUrl = parseContent[url];
						parseContentUrl.img.push(bgImg.imgSelectors[property]);
						//console.log(bgImg.imgSelectors[property]);
					}
				}
			};

			//let's grab some stuff
			getJs('script', 'src', parseContent.js);
			getCss('link', 'href', parseContent.css, function(){
				//parseCss(parseContent.css[0]);

			});

			getMeta('meta', url);
			getImg('img', url);
			getBgImg();

			if(typeof(callback) == "function"){
				callback();
			}


		}
	);
}

module.exports.parse = parse;
module.exports.parseContent = parseContent;
module.exports.globalArr = globalArr;
