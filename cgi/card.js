const version = require('../version.json').datetime;

module.exports = function (req, res) {
	console.log('----- Card reader response ------');
	console.log(req.body);
	console.log('---------------------------------');

	const result = { version, success: true };
	res.json(result);
};
