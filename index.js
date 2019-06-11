const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const log4js = require('log4js');

log4js.configure({
    appenders: {
        system: {type: 'file', filename: 'system.log'},
        access: {type: 'file', filename: 'access.log'},
    },
    categories: {
        default: {appenders:['system'], level: 'debug'},
        web: {appenders: ['access'], level: 'info'},
    },
});

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(log4js.connectLogger(log4js.getLogger('web')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
