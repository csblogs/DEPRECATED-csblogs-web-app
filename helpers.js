var moment = require('moment');

exports.dateFormat = function(datestamp) {
    var date = moment(datestamp);
    
    if (date.isBefore(moment(), 'week')) {
        return date.format('MMM D, YYYY');
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
    if (url.lastIndexOf('http://', 0) === 0) {
        url = url.substring(7);
        
        if (url.lastIndexOf('www.', 0) === 0) {
            url = url.substring(4);
        }
    }
    return url;
}
