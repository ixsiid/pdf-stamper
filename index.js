const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const log4js = require('log4js');
const stamp = require('./cgi/stamp');
const bodyParser = require('body-parser');

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
  .use(bodyParser.urlencoded({
    limit: '10mb',
    extended:true,
  }))
  .use(bodyParser.json())
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .post('/stamp', stamp)
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
