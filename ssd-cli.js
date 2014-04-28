/* jshint node: true */

var readline = require('readline'),
	rl,
	siteName,
	getSite,
	exit;

rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

exit = function() {
	rl.close();
}

getSite = function(callback) {
	rl.question("What site do you want to crawl?", function(answer) {
		siteName = answer;
		module.exports.siteName = siteName;
		callback();
		exit();
	});
}


module.exports.getSite = getSite;
module.exports.exit = exit;
