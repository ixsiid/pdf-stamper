const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const log4js = require('log4js');
const stamp = require('./cgi/stamp');
const bodyParser = require('body-parser');

log4js.configure({
    appenders: {
        system: { type: 'file', filename: 'system.log' },
        access: { type: 'file', filename: 'access.log' },
    },
    categories: {
        default: { appenders: ['system'], level: 'debug' },
        web: { appenders: ['access'], level: 'info' },
    },
});

express()
    .use(express.static(path.join(__dirname, 'public')))
    .use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    })
    .use(log4js.connectLogger(log4js.getLogger('web')))
    .use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))
    .use(bodyParser.json({ limit: '50mb' }))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.render('pages/index'))
    .post('/stamp', stamp)
    .listen(PORT, () => console.log(`Listening on ${PORT}`));
