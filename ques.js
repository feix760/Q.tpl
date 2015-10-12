
var _ = require('lodash');
var Promise = require('promise');
var utils = require('./utils');

function findHtml(root, vm) {
    root = root.replace(/\/?$/, '/');
    var html = utils.readFile(root + vm.name + '/main.html');
    if (html === null) {
        return null;
    }

    // replace $
    html = html.replace(/\$/g, vm.name);
    // add attribs
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

    var configQ = utils.load(utils.readFile(root + vm.name + '/sync.js'));
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

exports.find = function(root, vm) {
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

