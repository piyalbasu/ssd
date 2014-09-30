var jsdom = require('jsdom'),
	fs = require('fs'),
	http = require('http'),
	options = {
		host: 'www.cialis.com',
		path: ''
	},
	cleanArray = [],
	styleArray,
	imgSelectors = {

	},
	test = 'test';

//pase an arg or default to a string
options.path = (process.argv[2]) ? process.argv[2] : '/_Assets/css/main.css';


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

		init: function() {
			http.request(options, bgImg.callback).end();
		}
	}
})();

bgImg.init();
module.exports.imgSelectors = imgSelectors;
//module.exports = bgImg.init;
