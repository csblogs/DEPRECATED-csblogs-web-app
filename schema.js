var mongoose = require('mongoose')

// connect to mongo
mongoose.connect('mongodb://localhost/csblogs')

// define schema
exports.Blogger = mongoose.model('Blogger',{name: String, email: String, site: String,feed: String})

// create sample bloggers if none exist
exports.Blogger.find(function(error,bloggers) {
    if (error) {
        console.log('Error fetching bloggers :' + error)
    }
    else if (bloggers.length === 0) {
        var bloggerError = function (error) {
            if (error) {
                console.log('Error saving blogger :' + error)
            }
        }

        var pring = new exports.Blogger({
            name: 'Pring',
            email: 'alex@alexpringle.co.uk',
            site: 'alexpringle.co.uk',
            feed: 'alexpringle.co.uk/atom.xml'
        })
        var joe = new exports.Blogger({
            name: 'Joe Bloggs',
            email: 'joe@joe.co.uk',
            site: 'joe.co.uk',
            feed: 'joe.co.uk/atom.xml'
        })
        var tim = new exports.Blogger({
            name: 'Tim Tin',
            email: 'tim@tin.co.uk',
            site: 'tin.co.uk',
            feed: 'tin.co.uk/atom.xml'
        })

        pring.save(bloggerError)
        joe.save(bloggerError)
        tim.save(bloggerError)
    }
})
