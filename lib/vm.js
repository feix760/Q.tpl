
var _ = require('lodash');
var $ = require('cheerio');
var DEFAULT = require('./default');

function genStringsFactory() {
    var strings = {},
        id = 0;
    var fn = function(str) {
        strings[++id] = str;
        return '__tplstrings' + id;
    };
    fn.strings = strings;
    fn.value = function(id) {
        return strings[id] || null;
    };
    return fn;
}

function Vm(options) {

    options = options || {};

    this.name = options.name || '';

    this.parent = options.parent || null;

    this.$el = $(options.raw);

    this.stringsFactory = genStringsFactory();

    this.directives = 
        _.extend({}, options.directives || {}, DEFAULT.directives || {});

    this.submodules = [];

    // add vmInfo
    ['raw', 'directives', 'filters', 'data'].forEach(function(prop) {
        options[prop] && delete options[prop];
    });
    this.vmInfo = options;
}

Vm.prototype.addSubmodule = function(info) {
    var index = this.submodules.length;
    this.submodules.push(_.extend({}, info, {
        parent: this.name !== '_root' ? this.name : null,
        index: index
    }));
    return '{%{= __getVm(' + index + ') }%}';
};

module.exports = Vm;

