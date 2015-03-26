// Express.js and Middleware
var express = require('express');
var compression = require('compression');
var exphbs  = require('express-handlebars');
var lessMiddleware = require('less-middleware');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var helpers = require('./helpers');
var passport = require('./authentication').Passport;
var populateDatabase = require('./test-data/populate-database').Populate;

// Initialize app
var app = express();
app.use(compression());
app.use(lessMiddleware('/style', {
    dest: '/style/css',
    cacheFile: '/style/css/cache.json',
    pathRoot: __dirname + '/static'
}));
app.use(passport.initialize());
app.use(express.static(__dirname + '/static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.engine('handlebars', exphbs({defaultLayout: 'main', helpers: helpers}));
app.set('view engine', 'handlebars');

// Get any arguments passed via command-line
var args = process.argv.slice(2);

// Get database connection
mongoose.connect(process.env.CUSTOMCONNSTR_MONGODB_URI || 'mongodb://localhost');

var database = mongoose.connection;
database.on('error', console.error.bind(console, 'MongoDB Connection Error:'));
database.once('open', function (callback) {
    console.log('Database connection established successfully.')

    // Populate database with test data if required by user
    if(args.indexOf('setup-db') > -1) {
      console.log('Removing all database entries...')
      database.db.dropDatabase();
      console.log('Will now populate database with new test data...')
      populateDatabase();
    }

    // Import routes (and thus serve the site) if the database connection worked
    console.log('Now serving all routes!')
    require('./routes')(app);
});

// Initialize and start HTTP server
var port = process.env.PORT || 3000; //process.evn.PORT is required to work on Azure
var server = app.listen(port, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('HTTP Server live at http://localhost:%s', port);
});
