
var fs = require('fs');
var _ = require('lodash');
var Promise = require('promise');
var utils = require('./utils');
var tplLoader = require('./loader');

function findHtml(root, vm) {
    root = root.replace(/\/?$/, '/');
    var html = utils.readFile(root + vm.name + '/main.html');
    if (html === null) {
        return null;
    }

    // replace $
    html = html.replace(/\$/g, vm.name);
    html = html.replace(/>/, ' ' + _.map(vm.attribs, function(v, k) {
        return k + '="' + v + '"';
    }).join(' ') + '>');
    return html;
}

function findJs(root, vm) {
    root = root.replace(/\/?$/, '/');

    var guessQ = null;
    var code = utils.readFile(root + vm.name + '/main.js');
    if (code) {
        // 删除require
        code = code.replace(/require\([^)]*\)/g, '{}');
        guessQ = utils.load(code);
    }

    var resultQ = _.extend({
        filters: {},
        directives: {},
        data: {}
    }, guessQ || {});

    var configCode = utils.readFile(root + vm.name + '/sync.js');
    var configQ = configCode ? utils.load(configCode) : null;
    if (configQ) {
        // set config
        _.extend(resultQ.filters, configQ.filters || {});
        _.extend(resultQ.directives, configQ.directives || {});
        resultQ.data = configQ.data || resultQ.data;
    }

    utils.wrapObjFuns(resultQ.filters);

    var data = resultQ.data;
    if (typeof data !== 'function') {
        resultQ.data = function(loader) {
            if (loader.global) {
                return loader.global.then(function(global) {
                    return _.extend({}, data, global);
                });
            } else {
                return Promise.resolve(data);
            }
        };
    }

    return !configQ && !guessQ ? null : resultQ;
}

function findVm(root, vm) {
    var html = findHtml(root, vm);
    var js = findJs(root, vm);
    if (html && js) {
        // todo directives
        return {
            raw: html,
            filters: js.filters,
            data: js.data
        };
    } else {
        return null;
    } 
};

exports.compile = function(options) {
    var name = options.name;
    var root = options.root.replace(/\/?$/, '/');

    var vm = {
        raw: utils.readFile(root + name + '.html')
    };
    var vmFile = utils.readFile(root + 'pages/' + name + '/sync.js');
    if (vmFile) {
        _.extend(vm, utils.load(vmFile) || {});
    }
    return tplLoader.compile({
        root: vm,
        getQ: function(vm) {
            return findVm(root + '/components', vm);
        }
    });
};

exports.compileAll = function(options) {
    var root = options.root.replace(/\/?$/, '/');
    var list = fs.readdirSync(root);
    var all = {};
    _.each(list, function(file) {
        if (file.match(/([^\/\\]*)\.html$/)) {
            var name = RegExp.$1;
            all[name] = exports.compile(_.extend({}, options, {
                name: name
            }));
        }
    });
    return all;
};

