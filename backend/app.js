let express = require('express');
let http = require('http');

let app = express();



/**
 * Add headers
 */
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

/**
 * Routers
 */
let indexRouter = require('./app/routes/index');
let userRouter = require('./app/routes/user');
let mapRouter = require('./app/routes/map');
let xslRouter = require('./app/routes/xsl');
app.use('/server', indexRouter);
app.use('/server', userRouter);
app.use('/server', mapRouter);
app.use('/server', xslRouter);

/**
 * Exporting module
 */
module.exports = app;