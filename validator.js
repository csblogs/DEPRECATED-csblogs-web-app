/* Reference - modified code:
 * Node Validator
 * https://bitbucket.org/gregbacchus/node-validator/
 * by Greg Bacchus, 2 April 2015 05:26
 * MIT license
 */

exports.run = run;
exports.isObject = isObject;
exports.isString = isString;
exports.isEmail = isEmail;
exports.isUrl = isUrl;
exports.notWhitespace = notWhitespace;
exports.noSpaces = noSpaces;
exports.maxLength = maxLength;
exports.vanityUrl = vanityUrl;
exports.trimStrings = trimStrings;
exports.formatUrls = formatUrls;

var regex_blank = /\S/;
var regex_space = /\s/;
var regex_email = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e])|(\\[\x01-\x09\x0b\x0c\x0d-\x7f])))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))$/i;
var regex_vanityUrl = /^[a-z]([a-z0-9_-]+)*$/;

function run(validator, value, callback) {
    var errors = [];

    function onError(message, childName, childValue) {
        errors.push({
            parameter: childName,
            value: childValue,
            message: message
        });
    }

    validator.validate(value, onError);
    callback(errors.length, errors);
}

function ValidationError(details) {
    Error.call(this);
    Error.captureStackTrace(this, arguments.callee);
    this.name = 'ValidationError';
    this.message = "Validation failed";
    this.details = details;
}
ValidationError.prototype.__proto__ = Error.prototype;

function isObject() {
    var v = {
        withRequired: required,
        withOptional: optional,
        validate: validate
    };
    var rules = {};

    return v;

    function required(name, validator) {
        var validators = [];
        for (i = 1; i < arguments.length; ++i) {
            validators.push(arguments[i]);
        }
        
        rules[name] = { required: true, validator: validators };
        return v;
    }

    function optional(name, validator) {
        var validators = [];
        for (i = 1; i < arguments.length; ++i) {
            validators.push(arguments[i]);
        }
        
        rules[name] = { required: false, validator: validators };
        return v;
    }

    function validate(value, onError) {
        if (typeof value !== 'object') {
            onError('Incorrect type. Expected object.');
            return;
        }

        // check for unexpected values
        for (var parameter in value) {
            if (rules[parameter]) {
                continue;
            }

            onError('Unexpected value.', parameter, value[parameter]);
        }

        // check rules
        for (var parameterName in rules) {
            var parameterValue = value[parameterName];
            var rule = rules[parameterName];

            if (rule.required && isEmpty(parameterValue)) {
                onError('Value cannot be blank.', parameterName, parameterValue);
                continue;
            }
            else if (!rule.required && (!parameterValue || 0 === parameterValue.length)) {
                break; // Empty and not required
            }

            for (i = 0; i < rule.validator.length; ++i) {
                var hasError = false;
                
                //if (parameterValue === undefined || parameterValue === null || !rule.validator[i]) {
                //    continue;
                //}

                if (rule.validator[i]) {
                    rule.validator[i].validate(parameterValue, function(message, childName, childValue) {
                        var name;
                        if (childName) {
                            if (childName[0] === '[') {
                                name = parameterName + childName;
                            } else {
                                name = parameterName + '.' + childName;
                            }
                        } else {
                            name = parameterName;
                        }
                        onError(message, name, childValue !== undefined ? childValue : parameterValue);
                        hasError = true;
                    });
                }
                
                if (hasError) { break; }
            }
        }
    }
}

function isEmpty(value) {
    if (value === undefined || value === null) {
        return true;
    }
    if (!/\S/.test(value.toString())) {
        return true;
    }
    return false;
}

function isString(options) {
    return {
        validate: validate
    };

    function validate(value, onError) {
        if (typeof value !== 'string') {
            return onError('Incorrect type. Expected string.');
        }
        if (options) {
            if (options.regex && !options.regex.test(value)) {
                return onError(options.message || 'Invalid value. Value must match required pattern.');
            }
        }
        return null;
    }
}

function notWhitespace(message) {
    return {
        validate: validate
    };

    function validate(value, onError) {
        if (!regex_blank.test(value.toString())) {
            return onError(message || 'Value cannot be blank.');
        }
        return null;
    }
}

function isEmail(message) {
    return {
        validate: validate
    };

    function validate(value, onError) {
        if (!validateEmail(value.toString())) {
            return onError(message || 'Not a valid email address.');
        }
        return null;
    }
}

function maxLength(max) {
    return {
        validate: validate
    };

    function validate(value, onError) {
        if (value.toString().length > max) {
            return onError('Value must be less than ' + max + ' characters.');
        }
        return null;
    }
}

function noSpaces(message) {
    return {
        validate: validate
    };

    function validate(value, onError) {
        if (regex_space.test(value.toString())) {
            return onError(message || 'Value cannot contain spaces.');
        }
        return null;
    }
}

function vanityUrl(message) {
    return {
        validate: validate
    };

    function validate(value, onError) {
        if (!regex_vanityUrl.test(value.toString())) {
            return onError(message || 'Value must contain only a-z, 0-9, _, - and start with a letter.');
        }
        return null;
    }
}

function isUrl(message) {
    return {
        validate: validate
    };

    function validate(value, onError) {
        if (!validateUrl(value.toString())) {
            return onError(message || 'Value must be a valid URL.');
        }
        return null;
    }
}

function validateUrl(url) {
    if (!url || url.length >= 2083) {
        return false;
    }
    if (url.indexOf('mailto:') === 0) {
        return false;
    }
    options = {
        protocols: [ 'http' ],
        require_tld: true,
        require_protocol: true,
        allow_underscores: true,
        allow_trailing_dot: false,
        allow_protocol_relative_urls: false
    };
    var protocol, auth, host, hostname, port,
        port_str, split;
    split = url.split('://');
    if (split.length > 1) {
        protocol = split.shift();
        if (options.protocols.indexOf(protocol) === -1) {
            return false;
        }
    } else if (options.require_protocol) {
        return false;
    }  else if (options.allow_protocol_relative_urls && url.substr(0, 2) === '//') {
        split[0] = url.substr(2);
    }
    url = split.join('://');
    split = url.split('#');
    url = split.shift();

    split = url.split('?');
    url = split.shift();

    split = url.split('/');
    url = split.shift();
    split = url.split('@');
    if (split.length > 1) {
        auth = split.shift();
        if (auth.indexOf(':') >= 0 && auth.split(':').length > 2) {
            return false;
        }
    }
    hostname = split.join('@');
    split = hostname.split(':');
    host = split.shift();
    if (split.length) {
        port_str = split.join(':');
        port = parseInt(port_str, 10);
        if (!/^[0-9]+$/.test(port_str) || port <= 0 || port > 65535) {
            return false;
        }
    }
    if (!isFQDN(host, options) && host !== 'localhost') {
        return false;
    }
    return true;
}

function validateEmail(str) {
    if (regex_space.test(str)) {
        return false;
    }

    var parts = str.split('@'),
        domain = parts.pop(),
        user = parts.join('@');

    if (!isFQDN(domain)) {
        return false;
    }

    return regex_email.test(user);
}

function isFQDN(str) {
    options = {
        require_tld: true,
        allow_underscores: false,
        allow_trailing_dot: false
    };

    /* Remove the optional trailing dot before checking validity */
    if (options.allow_trailing_dot && str[str.length - 1] === '.') {
        str = str.substring(0, str.length - 1);
    }
    var parts = str.split('.');
    if (options.require_tld) {
        var tld = parts.pop();
        if (!parts.length || !/^([a-z\u00a1-\uffff]{2,}|xn[a-z0-9-]{2,})$/i.test(tld)) {
            return false;
        }
    }
    for (var part, i = 0; i < parts.length; i++) {
        part = parts[i];
        if (options.allow_underscores) {
            if (part.indexOf('__') >= 0) {
                return false;
            }
            part = part.replace(/_/g, '');
        }
        if (!/^[a-z\u00a1-\uffff0-9-]+$/i.test(part)) {
            return false;
        }
        if (part[0] === '-' || part[part.length - 1] === '-' ||
            part.indexOf('---') >= 0) {
            return false;
        }
    }
    return true;
}

function trimStrings(str) {
    for (i in str) {
        if (typeof str[i] === 'string') {
            str[i] = str[i].trim();
        }
    }
}

function formatUrls(blogger) {
    for (i = 1; i < arguments.length; ++i) {
        if (!isEmpty(blogger[arguments[i]])) {
            // Remove https:// at the start
            if (blogger[arguments[i]].lastIndexOf('https://', 0) === 0) {
                blogger[arguments[i]] = blogger[arguments[i]].substring(8);
            }

            // Add http:// if not at the start
            if (blogger[arguments[i]].lastIndexOf('http://', 0) !== 0) {
                blogger[arguments[i]] = 'http://' + blogger[arguments[i]];
            }

            // Remove any '/' at the end
            blogger[arguments[i]] = blogger[arguments[i]].replace(/[\/]*$/, '');
        }
    }
}
