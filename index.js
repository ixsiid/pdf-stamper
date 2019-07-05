const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5001;
const log4js = require('log4js');
const stamp = require('./cgi/stamp');
const stamp_cb = require('./cgi/stamp_callback');
const card = require('./cgi/card');
const bodyParser = require('body-parser');
const GC_AMOUNT = 150 * 1000 * 1000;

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

global.memory_limit = GC_AMOUNT;
global.memory_release = () => {
    if (process.memoryUsage().heapUsed > global.memory_limit) {
        global.gc();
        console.log(`Run garbage collection: memory usage ${process.memoryUsage().heapUsed}`);
    }
}

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
    .post('/stamp_cb', stamp_cb)
    .post('/card', card)
    .listen(PORT, () => console.log(`Listening on ${PORT}`));
