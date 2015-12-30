
var fs = require('fs');
var _ = require('lodash');

var noop = new Function();

function aop(obj, prop, before, after) {
    var fun = obj[prop];
    obj[prop] = function() {
        before && before.apply(this, arguments);
        var rt = fun.apply(this, arguments);
        after && after.apply(this, arguments);
        return rt;
    };
}

exports.wrapFn = function(obj) {
    _.each(obj, function(item, k) {
        if (typeof item === 'function') {
            var context = {};
            aop(obj, k, function() {
                // 如果在filters, directives里调用settimeout肯定要挂的
                context.setTimeout = setTimeout;
                setTimeout = noop;
                context.setInterval = setInterval;
                setInterval = noop;
            }, function() {
                setTimeout = context.setTimeout;
                setInterval = context.setInterval;
            });
        } else if (typeof item === 'object' && item) {
            exports.wrapObjFuns(item);
        }
    });
    return obj;
};

// dyna require
exports.load = function(str) {
    try {
        var m = new module.constructor();
        m._compile(str);
        return m.exports;
    } catch (ex) {
        return null;
    }
};

exports.readFile = function(path) {
    try {
        return fs.readFileSync(path).toString();
    } catch (ex) {
        return null;
    }
};

