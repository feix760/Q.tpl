var _ = require('lodash');
var $ = require('cheerio');
var Vm = require('./lib/vm');
var tags = require('./lib/tags');
var parse = require('./lib/parse');
var DEFAULT = require('./lib/default');

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

function filterExp(item) {
    return '__filterValue(__obj, ' + JSON.stringify(item) + ')';
}

/*
 * options.directives
 **/
function _compile(options) {
    options = options || {};

    var vm = new Vm(options),
        prefix = options.prefix || DEFAULT.prefix;

    walk(function(ele) {
        var attribs = Object.keys(ele.attribs);
        if (ele.name === 'content') {
            $(ele).replaceWith('{%{= __vm.content }%}');
        } else if (tags.isCustom(ele.name)) {
            $(ele).replaceWith(vm.addSubmodule({
                name: ele.name,
                content: $(ele).html(),
                attribs: ele.attribs
            }));
            return false;
        }
        attribs
            .filter(function(key) {
                if (key.indexOf(prefix) === 0)
                    return true;
            }).forEach(function(key) {
                var name = key.substring(prefix.length)
                    , directive = vm.directives[name];
                if (directive) {
                    parse(ele.attribs[key]).forEach(function(item) {
                        try {
                            (directive.update || directive).call({
                                el: ele,
                                arg: item.arg,
                                vm: vm
                            }, filterExp(item));
                        } catch(ex) {
                            console.warn('directive failed: ' + name);
                        }
                    });
                }
            });
    }, vm.$el);

    vm.$el
        // add class component-x
        .addClass(vm.stringsFactory(
            '{%{= !__vm.parent ? "component-" + __vm.index : ""}%}'
        ))
        // add q-vm
        .attr(vm.stringsFactory(
            '{%{= __vm.parent && !__vm.inline ? "q-vm=" + __vm.name : "" }%}'
        ));

    function tplstrings(str) {
        var id = +str.match(/__tplstrings(\d+)/)[1];
        return vm.stringsFactory.value(id);
    }

    // escape strings
    vm.tpl = vm.$el.toString()
        .replace(/\{%\{[\s\S]*?\}%\}/g, function(str) {
            return str.replace(/&quot;/g, '"');
        })
        .replace(/__tplstrings\d+\s?:\s?0;?/g, tplstrings) // style
        .replace(/__tplstrings\d+="0"\s?/g, tplstrings) // attr
        .replace(/__tplstrings\d+/g, tplstrings);

    delete vm.$el;
    delete vm.stringsFactory;
    delete vm.directives;
    return vm;
};

/**
 * @param {Object} options
 * {
 *      filters: {},
 *      directives: {},
 *      raw: 'html',
 *      parent: 'name'
 * }
 */
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

    var vm = _compile(options),
        _fun = _.template(vm.tpl);
    var fun = function(data) {
        data = _.extend({}, data, {
            __vm: data.__vm || {}, // 模块信息
            __filterValue: __filterValue,
            __getVm: function(index) {
                return data.__subHtml && data.__subHtml[index] || '';
            }
        });
        data.__obj = data;
        try {
            return _fun(data);
        } catch (ex) {
            console.warn('template error: ' + ex.toString());
            return options.raw;
        }
    };

    vm.tplFun = fun;
    fun.vm = vm;
    return fun;
};

