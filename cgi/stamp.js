const version = require('../version.json').datetime;
const childProcess = require('child_process');

module.exports = function (req, res) {
	const approved = childProcess.execSync(`python ./cgi/add_text.py "${req.body.author}"`, {
		input: Buffer.from(req.body.pdf['$content'], 'base64'),
		stdio: ['pipe', 'pipe', 'inherit'],
		maxBuffer: 50 * 1024 * 1024,
	});

	const result = { version };
	result.success = true;
	result.approved = "data:application/pdf;base64," + approved.toString('base64');
	result.message = `Your name is ${req.body.author}`;
	res.json(result);
};
