var moment = require('moment');
var html_strip = require('htmlstrip-native');

var html_decode_options = {
    include_script : false,
    include_style : false,
    compact_whitespace : true,
    include_attributes : {}
};

exports.truncateAndRemoveHTML = function (str, len) {
    str = html_strip.html_strip(str, html_decode_options);
    if (str.length > len && str.length > 0) {
        var new_str = str + " ";
        new_str = str.substr (0, len);
        new_str = str.substr (0, new_str.lastIndexOf(" "));
        new_str = (new_str.length > 0) ? new_str : str.substr (0, len);

        return new_str + '&hellip;'; 
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
