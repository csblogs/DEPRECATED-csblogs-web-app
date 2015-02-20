# Computer Science Blogs
A node.js web application serving the Computer Science blogging community. Hosted at csblogs.com

## Get Involved
CS Blogs is a project in its infancy, and so now is a great time to get involved! There are a few ways in which to do this, and these are outlined in some detail below.

### Reporting bugs and requesting features.
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

CS Blogs is a Node.js web application so you will have to have the node.js runtime installed. You can install node.js for OS X, Linux or Windows by following the instructions here: http://nodejs.org/download/

Once you have node installed clone this repository. Open a terminal and change directory (cd) to the location to which you cloned this repository. 

Type 'npm install' to download and install all of the dependencies required.

Type 'node server' and press enter. Something along the lines of the following will be displayed: "Website live at http://localhost:3000". Copy the localhost url and paste it into your favourite browser and you should see a completely local version of CSBlogs.com -- magic.

From there, start changing code as you see fit. If you need any help then feel free to contact d.t.brown@outlook.com :-)
