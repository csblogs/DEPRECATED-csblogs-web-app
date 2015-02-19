var express = require('express')
var compression = require('compression')

var app = express()

app.use(compression())
app.use(express.static(__dirname + '/static')) //Files in /static appear as if in root.
                                                //E.g. /static/default.css is shown to user as just /default.css

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function(req, res) {
  res.send('hello world')
})

var port = process.env.PORT || 3000; //process.evn.PORT is required to work on Azure
var server = app.listen(port, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Website live at at http://localhost:%s', port)
})
