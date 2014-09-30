var jsdom = require('jsdom'),
	fs = require('fs'),
	http = require('http'),
	cleanArray = [],
	styleArray,
	imgSelectors = {

	},
	test = 'test';

//pase an arg or default to a string



var bgImg = (function() {

	return {

		getSelector: function() {
			for (var i = cleanArray.length - 1; i >= 0; i--) {
				//console.log(imgSelectors.indexOf(cleanArray[i]));
				if (!imgSelectors.hasOwnProperty(cleanArray[i])) {
					//push just the selector if it's not already in there
					var justSel = cleanArray[i].split('{'),
					//Let's get rid of the exra characters like \n and \t
							cleanSel = justSel[0].replace(/\n/g, '').replace(/\t/g, ''),
					//Let's just isolate the image itself
							beginningOfImg = justSel[1].indexOf('url('),
							endOfImg = justSel[1].indexOf(')'),
							bgLine = justSel[1].substr(beginningOfImg, endOfImg),
							cleanImg = justSel[1].substr(beginningOfImg, endOfImg).match(/\((.*)\)/);
					imgSelectors[cleanSel] = cleanImg[0];
				}

				if (i === 0) {
					console.log();
					//bgImg.getSelectorImages();
				}
			};

		},

		styleArrayCleaner: function() {
			for (var i = styleArray.length - 1; i >= 0; i--) {


				if (styleArray[i].indexOf('url(') > 0) {
					cleanArray.push(styleArray[i]);
				}

				if (i === 0) {
					bgImg.getSelector();
				}

			};
		},

		callback: function(response) {
			var str = '',
				cleanStr = '';

			//another chunk of data has been recieved, so append it to `str`
			response.on('data', function(chunk) {
				str += chunk;
			});

			//the whole response has been recieved, so we just print it out here
			response.on('end', function() {
				//get rid of comments
				cleanStr = str.replace(/\/\*([\s\S]*?)\*\//mg, '');
				//split styles into array
				styleArray = cleanStr.split('}');
				bgImg.styleArrayCleaner();
			});
		},

		init: function(hostParam, pathParam) {
		var options = {
			host: hostParam,
			path: pathParam
		};
		//options.path = pathParam;
			http.request(options, bgImg.callback).end();
		}
	}
})();

//bgImg.init('www.cialis.com');
module.exports.init = bgImg.init;
module.exports.imgSelectors = imgSelectors;
//module.exports = bgImg.init;
