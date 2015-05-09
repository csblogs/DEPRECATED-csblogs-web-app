"use strict";

// Express.js and Middleware
var subdomain = require('express-subdomain');
var express = require('express');
var session = require('express-session');
var compression = require('compression');
var exphbs = require('express-handlebars');
var lessMiddleware = require('less-middleware');
var mongoose = require('mongoose');
var paginate = require('express-paginate');
var bodyParser = require('body-parser')
var passport = require('./authentication').Passport;
var helpers = require('./utils/helpers');

// Routes
var authentication = require('./authentication');
var website = require('./website');
var api = require('./api');
var feeds = require('./feeds');

var apiRouter = express.Router();
var feedsRouter = express.Router();

// Initialize app
var app = express();
app.use(compression());
app.use(lessMiddleware('/style', {
    dest: '/style/css',
    cacheFile: '/style/css/cache.json',
    pathRoot: __dirname + '/static'
}));
app.use(session({
    secret: 'dijkstraconsidersgotoharmful',
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/static'));
app.use(paginate.middleware(10, 50));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    helpers: helpers
}));
app.set('view engine', 'handlebars');

// Logging for all requests
app.use(function(req, res, next) {
    if(req.user) {
        var id = req.user.userId || req.user.id;
        var provider = req.user.userProvider || req.user.provider;
        console.log("[%s] %s requested by user(%s@%s) @ IP: %s", req.method, req.path, id, provider, req.ip);
    }
    else {
        console.log("[%s] %s requested by unknown user @ IP: %s ", req.method, req.path, req.ip);
    }
    next();
});

// Get any arguments passed via command-line
var args = process.argv.slice(2);

// Get database connection
mongoose.connect(process.env.CUSTOMCONNSTR_MONGODB_URI || 'mongodb://localhost');

var database = mongoose.connection;
database.on('error', console.error.bind(console, 'MongoDB Connection Error:'));
database.once('open', function(callback) {
    console.log('Database connection established successfully.');

    // Import routes (and thus serve the site) if the database connection worked
    feeds.serveRoutes(feedsRouter);
    app.use(subdomain('feeds', feedsRouter));
    
    api.serveRoutes(apiRouter);
    app.use(subdomain('api', apiRouter));
    
    authentication.serveOAuthRoutes(app);
    
    website.serveRoutes(app);
    
    console.log('Now serving all routes!');
});

// Initialize and start HTTP server
var port = process.env.PORT || 3000; //process.evn.PORT is required to work on Azure
var server = app.listen(port, function() {

    var host = server.address().address;
    var port = server.address().port;

    console.log('HTTP Server live at http://localhost:%s', port);
});
