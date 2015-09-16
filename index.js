var _ = require('lodash');
var $ = require('cheerio');
var mTpl = require('micro-tpl');

var DEFAULT = {
    prefix: 'q-',
    directives: require('./directives')
};

function walk(foo, elems) {
    var childs, elem, tmp;
    for (var i = 0, j = elems.length; i < j; i++) {
        elem = elems[i];
        if (elem.type === 'tag') {
            childs = [].concat(elem.children);
            if (!foo(elem)) {
                childs &&
                    walk(foo, childs);
            } else {
                childs &&
                    walk(function() {}, childs);
            }
        }
    }
}

function genStringsFactory(factory) {
    var id = 0;
    return function(str) {
        factory[++id] = str;
        return '__tplstrings' + id;
    };
}

/*
 * options.directives
 **/
exports.tplCode = function(str, options) {
    options = options || {};
    var dom = $('<div>' + str + '</div>')
        , directives = _.extend({}, options.directives, DEFAULT.directives)
        , prefix = options.prefix || DEFAULT.prefix
        , strings = {}
        , stringsFactory = genStringsFactory(strings);
    walk(function(ele) {
        var attribs = Object.keys(ele.attribs);
        attribs
            .filter(function(key) {
                if (key.indexOf(prefix) === 0)
                    return true;
            }).forEach(function(key) {
                var name = key.substring(prefix.length)
                    , match = ele.attribs[key].match(/^((\S*)\s*:)?([\s\S]*)$/)
                    , directive = directives[name];
                if (directive && match) {
                    var exp = '_filterValue(this, "' + match[3] + '")'
                        , arg = match[2] || null;
                    (directive.update || directive).call({
                        el: ele,
                        arg: arg,
                        strings: stringsFactory
                    }, exp, arg);
                }
            });
    }, dom);

    function tplstrings(str) {
        var id = +str.match(/__tplstrings(\d+)/)[1];
        return strings[id] !== 'undefined' ? strings[id] : str;
    }

    return dom.toString()
        .replace(/\{\{[\s\S]*?\}\}/g, function(str) {
            return str.replace(/&quot;/g, '"');
        })
        .replace(/__tplstrings\d+\s?:\s?0;?/g, tplstrings) // style
        .replace(/__tplstrings\d+="0"\s?/g, tplstrings) // attr
        .replace(/__tplstrings\d+/g, tplstrings)
        .replace(/\{\{/g, '<%')
        .replace(/\}\}/g, '%>');
};

