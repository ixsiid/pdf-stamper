const version = require('../version.json').datetime;

module.exports = function (req, res) {
    const result = { version };
    result.success = true;
    result.pdf = req.body.pdf;
    result.message = `Your name is ${req.body.author}`;
    res.json(result);
};
