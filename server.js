// Express.js and Middleware
var express = require('express');
var compression = require('compression');
var exphbs  = require('express-handlebars');
var lessMiddleware = require('less-middleware');
var mongoose = require('mongoose');
var helpers = require('./helpers');
var populate-database = require('./test-data/populate-database').Populate;

// Initialize app
var app = express();
app.use(compression());
app.use(lessMiddleware('/style', {
    dest: '/style/css',
    cacheFile: '/style/css/cache.json',
    pathRoot: __dirname + '/static'
}));
app.use(express.static(__dirname + '/static'));
app.engine('handlebars', exphbs({defaultLayout: 'main', helpers: helpers}));
app.set('view engine', 'handlebars');

// Get database connection
mongoose.connect(process.env.CUSTOMCONNSTR_MONGODB_URI || "mongodb://localhost");

var database = mongoose.connection;
database.on('error', console.error.bind(console, 'MongoDB Connection Error:'));
database.once('open', function (callback) {
    console.log("Database connection established successfully.")

    // Populate database with test data if required by user
    

    // Import routes (and thus serve the site) if the database connection worked
    require('./routes')(app, database);
});

// Initialize and start HTTP server
var port = process.env.PORT || 3000; //process.evn.PORT is required to work on Azure
var server = app.listen(port, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Website live at http://localhost:%s', port);
});
