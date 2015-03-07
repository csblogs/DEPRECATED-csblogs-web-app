// Express.js and Middleware
var express = require('express')
var compression = require('compression')
var exphbs  = require('express-handlebars')
var lessMiddleware = require('less-middleware')
var mongoose = require('mongoose')
var helpers = require('./helpers')

// CSBlogs prototypes
var blogger = require('./models/blogger')
var blog = require('./models/blog')
var organisation = require('./models/organisation')

// Initialize app
var app = express()
app.use(compression())
app.use(lessMiddleware(__dirname + '/static', {cacheFile: __dirname + '/static/style/cache.json'}))
app.use(express.static(__dirname + '/static'))
app.engine('handlebars', exphbs({defaultLayout: 'main', helpers: helpers}))
app.set('view engine', 'handlebars')

// Get database connection
mongoose.createConnection(process.env.CUSTOMCONNSTR_MONGODB_URI || "mongodb://localhost")

// Import routes
require('./routes')(app, blogger, blog, organisation, mongoose)

// Initialize and start HTTP server
var port = process.env.PORT || 3000; //process.evn.PORT is required to work on Azure
var server = app.listen(port, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Website live at http://localhost:%s', port)
})
