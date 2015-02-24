var mongoose = require('mongoose')

// define schema
exports.Blogger = mongoose.model('Blogger', {name: String, email: String, site: String,feed: String})

// create sample bloggers if none exist
exports.Blogger.find(function(error,bloggers) {
    if (error) {
        console.error('Error fetching bloggers: ' + error)
    }
    else if (bloggers.length === 0) {
        var bloggerError = function (error) {
            if (error) {
                console.error('Error saving blogger: ' + error)
            }
        }

        var pring = new exports.Blogger({
            name: 'Pring',
            email: 'alex@alexpringle.co.uk',
            site: 'alexpringle.co.uk',
            feed: 'alexpringle.co.uk/atom.xml'
        })
        var danny = new exports.Blogger({
            name: 'Daniel Brown',
            email: 'd.t.brown@outlook.com',
            site: 'dannybrown.net',
            feed: 'dannycomputerscientist.wordpress.com/feed'
        })

        pring.save(bloggerError)
        danny.save(bloggerError)
    }
})
