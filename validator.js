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
exports.notEmpty = notEmpty;

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
        withCustom: custom,
        validate: validate
    };

    var rules = {};
    var globalRules = [];

    return v;

    function required(name, validator) {
        rules[name] = { required: true, validator: validator };
        return v;
    }

    function optional(name, validator) {
        rules[name] = { validator: validator };
        return v;
    }

    function custom(customValidator) {
        globalRules.push({ validator: { validate: customValidator } });
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

            if ((parameterValue === undefined || parameterValue === null) && rule.required) {
                onError('Required value.', parameterName, parameterValue);
                continue;
            }

            if (parameterValue === undefined || parameterValue === null || !rule.validator) {
                continue;
            }

            if (rule.validator) {
                rule.validator.validate(parameterValue, function(message, childName, childValue) {
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
                    onError(message, name, childValue !== undefined ? childValue : parameterValue)
                });
            }
        }

        // global rules
        for (var i in globalRules) {
            var globalRule = globalRules[i];

            if (globalRule.validator) {
                globalRule.validator.validate(value, onError);
            }
        }
    }
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

function notEmpty(message) {
    return {
        validate: validate
    };

    function validate(value, onError) {
        if (typeof value !== 'string') {
            return onError('Incorrect type. Expected string.');
        }
        if (!/\S/.test(value)) {
            return onError(message || 'Required field');
        }
        return null;
    }
}
