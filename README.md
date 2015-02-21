# Computer Science Blogs
A node.js web application serving the Computer Science blogging community. Hosted at csblogs.com

## Get Involved
CS Blogs is a project in its infancy, and so now is a great time to get involved! There are a few ways in which to do this, and these are outlined in some detail below.

### Reporting bugs and requesting features
If something weird has happened when you've been browsing the site, or you would love a certain feature added then please don't hesistate to report it. Both bug reports and feature requests can be added as issues on the issue tracker that is avalible here: https://github.com/csblogs/csblogs/issues.

On the issue tracker simply hit the "New Issue" button and fill in the required fields. With bug reports its often useful to know information such as:

* What browser you were using
* What operating system you were using
* The URL of the page you were on

So please make sure you include these details! A screenshot can often be really useful too.

If you have a feature request please describe it in detail, describe some possible solutions and consider providing a mockup screenshot.

### Writing Code
If you would like to contribute code to the project (and why wouldn't you!? Its great for the CV) then you should follow the model of the github flow, which is described in detail here: https://guides.github.com/introduction/flow/

Its often most useful to start by working on an issue in the issue tracker which has been confirmed as something we would like to fix or implement. Make sure to comment in the issue you would like to resolve to ensure you're not duplicating work someone else is already doing. If you don't write code which resolves an issue it is unlikely to be accepted, we need to know how the application is going to fit together, and accepting random bits of code -- no matter how good -- detract from this.

#### How to set up the development environment
To be able to develop code you will have to be able to set up the development environment.

##### Download MongoDB and Node.js
CS Blogs is a Node.js web application so you will have to have the node.js runtime installed. You can install node.js for OS X, Linux or Windows by following the instructions here: http://nodejs.org/download/. We use MongoDB as our database, so you will also have to install that following the instructions here https://www.mongodb.org/downloads

##### Fork and Clone this Repository
Fork this repository through the Github interface (press the fork button in the top right of the github page above this readme file). Clone your fork of the repository though a command line git interface (advanced) or github for mac or windows (Downloads: http://mac.github.com and http://windows.github.com)

##### Setup your Local Database
Open a terminal window if using Linux or OSX or cmd if running windows. Navigate to the directory into which you cloned this repository using the cd command.

If Linux or mac:
* Make a directory for the database data to be stored. 'mkdir -p ./database'
* Start the Database daemon, telling it where the database folder you just made is 'mongod --dbpath ./database'
* Leave this terminal window open and launch another one

If Windows:
* Make a directory for the database data to be stored. 'md database'
* Change directory to the location monogodb was installed. Normally this will be 'C:\Program Files\MongoDB 2.6 Standard\bin'
* Start the database service, telling it the location of the database folder you just made is 'mongod --dbpath [LOCATION OF REPO]/database'
* Leave this terminal window open and launch another one

##### Resolve Node Dependencies and Run
Navigate to the directory into which you cloned this repository using the cd command.

Type 'npm install' to download and install all of the node dependencies required.

Type 'npm start' and press enter. Something along the lines of the following will be displayed: "Website live at http://localhost:3000". Copy the localhost url and paste it into your favourite browser and you should see a completely local version of CSBlogs.com -- magic.

From there, start changing code as you see fit. If you need any help then feel free to contact d.t.brown@outlook.com :-)
