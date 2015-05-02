/* Reference - modified code:
 * Node Validator
 * https://bitbucket.org/gregbacchus/node-validator/
 * by Greg Bacchus, 2 April 2015 05:26
 * MIT license
 */

var moment = require('moment');

exports.run = run;
exports.isObject = isObject;
exports.isString = isString;
exports.isEmail = isEmail;
exports.notWhitespace = notWhitespace;

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
        if (!/\S/.test(value.toString())) {
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
        if (!/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i.test(value.toString())) {
            return onError(message || 'Not a valid email address.');
        }
        return null;
    }
}
