/* jshint node: true */

var ssdParse = require('./ssd-parse'),
	fs = require('fs'),
	countInArray,
	tempSelArray;

// var urlArray =
// 	[
// 	'http://www.cialis.com/',
// 	'http://www.cialis.com/about-ed-and-bph.aspx'
// ];

function getSelectorImages(imgSelectors) {
	for(var i = imgSelectors.length - 1; i >=0; i--){
			var img = document.querySelector(imgSelectors[i]),
			style = img.currentStyle || window.getComputedStyle(img, false),
			bi = style.backgroundImage.slice(4, -1);
	}
}


//callback when loop is over...this is nifty
function urlToParse(i, urlArray, sitename) {
	if( i < urlArray.length){
		ssdParse.parse(urlArray[i], sitename, function(){
			urlToParse(i + 1, urlArray, sitename);

		});
	}
	else {
		//whaddya got for me?
		//console.log(content);
		cleanFirstArray(0, urlArray);

	}
}


function cleanFirstArray(i, urlArray) {
	var content;
	var firstImgArray = ssdParse.parseContent[urlArray[0]]['img'];
	if ( i < firstImgArray.length) {
		if (firstImgArray.indexOf(ssdParse.globalArr[i]) > -1 ) {
				firstImgArray.splice(ssdParse.globalArr[i], firstImgArray.indexOf(ssdParse.globalArr[i]));
			}
			cleanFirstArray(i +1, urlArray);
	}
	else {
		content = JSON.stringify(ssdParse.parseContent);
		fs.writeFile('message.txt', content.replace(/:/g,':\n\t').replace(/,/g,',\n'), function (err) {

        if (err) throw err;

        console.log('It\'s saved! in same location.');

    });
		console.log(ssdParse.parseContent);
	}
}

module.exports.urlToParse = urlToParse;
