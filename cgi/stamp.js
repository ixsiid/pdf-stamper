const version = require('../version.json').datetime;

module.exports = function (req, res) {
    const result = { version };
    result.message = `Your name is ${req.body.name}`;
    res.json(result);
};
