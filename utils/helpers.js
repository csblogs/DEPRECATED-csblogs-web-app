"use strict";

var moment = require('moment');
var sanitizeHtml = require('sanitize-html');

exports.truncateAndRemoveHTML = function (str, len) {
    str = sanitizeHtml(str, {
        allowedTags: [],
        allowedAttributes: {}
    });
    if (str.length > len && str.length > 0) {
        var new_str = str + " ";
        new_str = str.substr (0, len);
        new_str = str.substr (0, new_str.lastIndexOf(" "));
        new_str = (new_str.length > 0) ? new_str : str.substr (0, len);

        return new_str + '&hellip;'; 
    }
    
    //Some blogs leave annoying bits at then end, such as their own
    //continue reading link or ellipses. Remove these.
	var continueReadingPosition = str.indexOf('… Continue reading →');
    if(continueReadingPosition !== -1) {
        str = str.substring(0, continueReadingPosition);
    }
    
    var readMorePosition = str.indexOf('... Read more');
    if(readMorePosition !== -1) {
        str = str.substring(0, readMorePosition);
    }
    
    if (str.indexOf('[…]', str.length - 3) !== -1) {
        str = str.substring(0, str.length - 3);
    }
    return str;
};

exports.formatDateShort = function(datestamp) {
    try {
        var date = moment(datestamp);

        if (date.isBefore(moment(), 'week')) {
            return date.format('MMM D, YYYY');
        }
        else {
            return date.fromNow();
        }
    }
    catch (error) {
        return '';
    }
};

exports.formatDateLong = function(datestamp) {
    try {
        var date = moment(datestamp);

        if (date.isBefore(moment(), 'week')) {
            return date.format('MMMM D, YYYY  h:mm a');
        }
        else {
            return date.fromNow();
        }
    }
    catch (error) {
        return '';
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
	if(typeof url !== 'undefined' && url != null) {
	    if (url.lastIndexOf('http://', 0) === 0) {
	        url = url.substring(7);
        
	        if (url.lastIndexOf('www.', 0) === 0) {
	            url = url.substring(4);
	        }
	    }
	    return url;
	} 
}

exports.ifEqualBlogger = function(user, blogger, options) {
    if (user && blogger && (user.userId === blogger.userId) && (user.userProvider === blogger.userProvider)) {
        return options.fn(this);
    }
    else
    {
        return options.inverse(this);
    }
}

exports.add = function(number1, number2) {
    if (isNaN(parseInt(number1)) || isNaN(parseInt(number2))) {
        return '';
    }
    else {
        return number1 + number2;
    }
}

exports.ifInvalid = function(errors, options) {
    if (errors) {
        for (var i = 0; i < errors.length; ++i) {
            if (errors[i].parameter === options.hash.name) {
                return 'class=invalid';
            }
        }
    }
    return '';
}
