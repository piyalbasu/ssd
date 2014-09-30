/* jshint node: true */

var ssdParse = require('./ssd-parse'),
	bgImg = require('./bgImg'),
	countInArray,
	tempSelArray;

var urlArray =
	[
	'http://www.cialis.com/',
	'http://www.cialis.com/about-ed-and-bph.aspx'
];

function getSelectorImages(imgSelectors) {
	for(var i = imgSelectors.length - 1; i >=0; i--){
			var img = document.querySelector(imgSelectors[i]),
			style = img.currentStyle || window.getComputedStyle(img, false),
			bi = style.backgroundImage.slice(4, -1);
		console.log(bi);
	}
}


//callback when loop is over...this is nifty
function urlToParse(i) {
	if( i < urlArray.length){
		ssdParse.parse(urlArray[i], function(){
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
	var firstImgArray = ssdParse.parseContent[urlArray[0]]['img'];
	if ( i < firstImgArray.length) {
		if (firstImgArray.indexOf(ssdParse.globalArr[i]) > -1 ) {
				firstImgArray.splice(ssdParse.globalArr[i], firstImgArray.indexOf(ssdParse.globalArr[i]));
			}
			cleanFirstArray(i +1);
	}
	else {
		console.log(ssdParse.parseContent);
	}
}
