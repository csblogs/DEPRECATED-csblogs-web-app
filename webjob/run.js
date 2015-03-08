var mongoose = require('mongoose')
var blogger = require('blogger')

mongoose.createConnection(process.env.CUSTOMCONNSTR_MONGODB_URI || "mongodb://localhost")
