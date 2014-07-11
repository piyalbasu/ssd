/* jshint node: true */

var parse = require('./ssd-parse'),
	bgImg = require('./bgImg'),
	countInArray,
	content = {
		js: [],
		css: []
	},
	global = [],
	imgUrlSelectors = [],
	tempSelArray;

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


function parseCss(url) {
	tempSelArray = bgImg();
	if (tempSelArray) {
		for (var i = tempSelArray.length - 1; i >= 0; i--) {
			if (imgUrlSelectors.indexOf(tempSelArray[i]) < 0){
				imgUrlSelectors.push(tempSelArray[i]);
			}

			if (i === 0) {
				//console.log(tempSelArray);
			}
		};
	}
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
