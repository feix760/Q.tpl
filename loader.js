var _ = require('lodash');
var Promise = require('promise');
var Qtpl = require('./index');

function _compile(id, getQ) {
    var q = getQ(id);
    q.tpl = Qtpl.compile(q);
    q.submodules = q.tpl.submodules.map(function(item) {
        return _compile(item, getQ);
    });
    return q;
}

// 把所有的请求全发出去
function _sendRequrest(q, loader) {
    var datas = q.data ? q.data(loader) : Promise.resolve({});
    datas.submodules = q.submodules.map(function(item) {
        return _sendRequrest(item, loader);
    });
    return datas;
}

// 后序遍历渲染
function _transfer(q, datas, loader) {
    if (q.submodules.length) {
        var submodules = q.submodules.map(function(item, i) {
            return _transfer(item, datas.submodules[i], loader);
        });
        return Promise.all(submodules).then(function(submodules) {
            return datas.then(function(data) {
                data = _.extend({}, data, {_vm: submodules});
                return q.tpl(data);
            });
        });
    } else {
        return datas.then(function(data) {
            return q.tpl(data);
        });
    }
}

exports.compile = function(options) {
    options = options || {};
    var q = _compile(options.root, options.getQ);
    return function(loader) {
        var datas = _sendRequrest(q, loader);
        return _transfer(q, datas, loader);
    }
};

