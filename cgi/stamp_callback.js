const version = require('../version.json').datetime;
const childProcess = require('child_process');
const fetch = require('node-fetch');

module.exports = function (req, res) {
	global.memory_release();

	const date = new Date();
	date.setHours(date.getHours() + 9);
	const sign = date.toISOString().substring(0, 10) + "\n" + req.body.author;
	const args = ['./cgi/add_text.py', sign, '-x 10', `-y ${29.5 + req.body.place * 10.5}`, '-p 8'];
	const write_buffer = Buffer.from(req.body.pdf['$content'] || req.body.pdf, 'base64');

	const p = childProcess.spawn('python', args, {
		stdio: ['pipe', 'pipe', 'pipe'],
		maxBuffer: write_buffer.length / 2,
	});
	p.approved = Buffer.alloc(0);
	p.stdout.on('data', data => {
		p.approved = Buffer.concat([p.approved, data]);
	});
	p.stderr.on('data', data => {
		console.log(data);
	});
	p.on('close', code => {
		const method = 'POST';
		const headers = { 'Content-Type': 'application/json' };
		const body = {
			name: 'Drawings Approval',
			parameter: req.body.parameter,
		};

		if (code !== 0) {
			// エラー通知
			console.log('Error');
			body.success = false;
			body.pdf = '';
			fetch(req.body.webhook, { method, headers, body: JSON.stringify(body) })
				.then(() => console.log('Error result is sended'))
				.catch(console.error);
			return;
		} else {
			body.success = true;
			body.pdf = p.approved.toString('base64');
			fetch(req.body.webhook, { method, headers, body: JSON.stringify(body) })
				.then(() => console.log('Stamped pdf is finish to send'))
				.catch(console.error);
		}
	});
	p.stdin.write(write_buffer);
	p.stdin.end()

	const result = { version };
	result.success = true;
	result.message = 'Request is accepted';
	res.json(result);
};
