var moment = require('moment');

exports.formatDateShort = function(datestamp) {
    var date = moment(datestamp);
    
    if (date.isBefore(moment(), 'week')) {
        return date.format('MMM D, YYYY');
    }
    else {
        return date.fromNow();
    }
};

exports.formatDateLong = function(datestamp) {
    var date = moment(datestamp);

    if (date.isBefore(moment(), 'week')) {
        return date.format('MMMM D, YYYY  h:mm a');
    }
    else {
        return date.fromNow();
    }
};

exports.section = function(name, options) {
    if(!this._sections) {
        this._sections = {};
    }
    this._sections[name] = options.fn(this);
    return null;
}

exports.urlFormat = function(url) {
	if(typeof url !== "undefined" && url != null) {
	    if (url.lastIndexOf('http://', 0) === 0) {
	        url = url.substring(7);
        
	        if (url.lastIndexOf('www.', 0) === 0) {
	            url = url.substring(4);
	        }
	    }
	    return url;
	} 
}

exports.editable = function(user, blogger) {
    return ((user.userId === blogger.userId) && (user.userProvider === blogger.userProvider));
}
