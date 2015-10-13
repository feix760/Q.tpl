var _ = require('lodash');
var $ = require('cheerio');
var tags = require('./tags');
var parse = require('./parse');
var DEFAULT = require('./default');

_.extend(_.templateSettings, {
    evaluate: /\{%\{(.+?)\}%\}/g,
    interpolate: /\{%\{=(.+?)\}%\}/g,
    escape: /\{%\{-(.+?)\}%\}/g
});

function walk(foo, elems) {
    var childs, elem, tmp;
    for (var i = 0, j = elems.length; i < j; i++) {
        elem = elems[i];
        if (elem.type === 'tag') {
            childs = [].concat(elem.children);
            if (foo(elem) !== false && childs.length) {
                walk(foo, childs);
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

function filterExp(item) {
    return '__filterValue(__obj, ' + JSON.stringify(item) + ')';
}

/*
 * options.directives
 **/
function tplCode(options) {
    options = options || {};
    var dom = $(options.raw)
        , directives = 
            _.extend({}, options.directives || {}, DEFAULT.directives || {})
        , prefix = options.prefix || DEFAULT.prefix
        , strings = {}
        , stringsFactory = genStringsFactory(strings);
    walk(function(ele) {
        var attribs = Object.keys(ele.attribs);
        if (tags.isCustom(ele.name)) {
            var index = options.submodules.length;
            options.submodules.push({
                index: index,
                attribs: ele.attribs,
                name: ele.name
            });
            $(ele).replaceWith('{%{= __getVm(' + index + ') }%}');
            return false;
        }
        attribs
            .filter(function(key) {
                if (key.indexOf(prefix) === 0)
                    return true;
            }).forEach(function(key) {
                var name = key.substring(prefix.length)
                    , directive = directives[name];
                if (directive) {
                    parse(ele.attribs[key]).forEach(function(item) {
                        try {
                            (directive.update || directive).call({
                                el: ele,
                                arg: item.arg,
                                strings: stringsFactory,
                                submodules: options.submodules
                            }, filterExp(item));
                        } catch(ex) {
                            console.warn('directive failed: ' + name);
                        }
                    });
                }
            });
    }, dom);

    function tplstrings(str) {
        var id = +str.match(/__tplstrings(\d+)/)[1];
        return typeof strings[id] !== 'undefined' ? strings[id] : str;
    }

    return dom.toString()
        .replace(/\{%\{[\s\S]*?\}%\}/g, function(str) {
            return str.replace(/&quot;/g, '"');
        })
        .replace(/__tplstrings\d+\s?:\s?0;?/g, tplstrings) // style
        .replace(/__tplstrings\d+="0"\s?/g, tplstrings) // attr
        .replace(/__tplstrings\d+/g, tplstrings);
};

exports.tplCode = tplCode;

exports.compile = function(options) {
    options = _.extend({}, options || {});

    var filters = _.extend({}, options.filters || {}, DEFAULT.filters || {});
    function __filterValue(data, exp) {
        var root = data[exp.name];
        var name, args;
        for (var i = 0; i < exp.filters.length; i++) {
            try {
                name = exp.filters[i][0];
                args = [].concat(exp.filters[i]);
                args[0] = root;
                root = filters[name].apply(data, args);
            } catch(ex) {
                console.warn('filter failed: ' + name);
                return root;
            }
        }
        return root;
    }

    options.submodules = [];
    var tpl = tplCode(options);
    var foo = _.template(tpl);

    var fun = function(data) {
        data = _.extend({}, data, {
            __filterValue: __filterValue,
            __getVm: function(index) {
                var html = data._vm && data._vm[index] || '';
                if (!options.isRoot) {
                    html = html.replace(/>/, ' q-vm="' + options.submodules[index].name + '">');
                } else {
                    html = html.replace(/(class=")/, '$1component-' + (index + 1) + ' ');
                }
                return html;
            }
        });
        data.__obj = data;
        try {
            return foo(data);
        } catch (ex) {
            console.warn('template error: ' + ex.toString());
            return '';
        }
    };
    fun.submodules = options.submodules;
    return fun;
};

