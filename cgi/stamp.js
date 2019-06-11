module.exports = function (req, res) {
    const result = {};
    result.message = `Your name is ${req.body.name}`;
    res.json(result);
};
