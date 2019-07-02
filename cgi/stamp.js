const version = require('../version.json').datetime;
const childProcess = require('child_process');

module.exports = function (req, res) {
	global.memory_release();
	
	const date = new Date();
	date.setHours(date.getHours() + 9);
	const sign = date.toISOString().substring(0, 10) + "\n" + req.body.author;
	const args = ['./cgi/add_text.py', sign, '-x 10', `-y ${29.5 + req.body.place * 10.5}`, '-p 8'];
	const approved = childProcess.spawnSync('python', args, {
		input: Buffer.from(req.body.pdf['$content'] || req.body.pdf, 'base64'),
		stdio: ['pipe', 'pipe', 'inherit'],
		maxBuffer: 50 * 1024 * 1024,
	});

	const result = { version };
	result.success = true;
	result.approved = approved.output[1].toString('base64');
	result.message = `Your name is ${req.body.author}`;
	res.json(result);
};
