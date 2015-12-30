
var fs = require('fs');
var _ = require('lodash');
var utils = require('./lib/utils');
var tplLoader = require('./loader');

function findHtml(root, vm) {
    root = root.replace(/\/?$/, '/');
    var html = utils.readFile(root + vm.name + '/main.html');
    if (html === null) {
        return null;
    }

    // replace $
    html = exports.replaceholder(html, vm.name);
    html = html.replace(/>/, ' ' + _.map(vm.attribs, function(v, k) {
        return k + '="' + v + '"';
    }).join(' ') + '>');
    return html;
}

function findJs(root, vm) {
    root = root.replace(/\/?$/, '/');

    var rawFile = utils.readFile(root + vm.name + '/main.js'),
        raw = rawFile 
            && utils.load(rawFile.replace(/require\([^)]*\)/g, '{}')),
        syncFile = utils.readFile(root + vm.name + '/sync.js'),
        sync = syncFile ? utils.load(syncFile) : null;
    return {
        filters: utils.wrapFn(
            _.extend(raw && raw.filters || {}, sync && sync.filters || {})
        ),
        directives: 
            _.extend(raw && raw.directives || {}, sync && sync.filters || {}),
        rawData: raw && raw.data || {},
        data: sync && sync.data || {}
    };
}

function findVm(root, vm) {
    var html = findHtml(root, vm);
    var js = findJs(root, vm);
    if (html && js) {
        // todo directives
        return _.extend(js, {
            raw: html
        });
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

/**
 * export replaceholder function for fis-ques
 */
exports.replaceholder = function (html, name) {
    return html.replace(/\$__/g, name + '__')
        .replace(/\$__\$/g, name);
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

