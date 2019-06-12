const version = require('../version.json').datetime;
const childProcess = require('child_process');

module.exports = function (req, res) {
	const approved = childProcess.execSync('python ./cgi/add_text.py', {
		input: Buffer.from(req.body.pdf['$content'], 'base64'),
	});

	const result = { version };
	result.success = true;
	result.approved = approved;
	result.message = `Your name is ${req.body.author}`;
	res.json(result);
};
