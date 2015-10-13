var _ = require('lodash');
var Promise = require('promise');
var Qtpl = require('./index');

function _compile(vm, getQ, isRoot) {
    var q = vm._isVm ? vm : getQ(vm);
    if (!q) {
        console.warn('could not get Q: ' + JSON.stringify(vm));
        return {
            submodules: [],
            tpl: function() {return ''}
        };
    }

    q.isRoot = !!isRoot;
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
        // 可以通过loader共享数据
        return _sendRequrest(item, loader);
    });
    return datas;
}

// 后序遍历渲染
function _transfer(q, datas) {
    if (q.submodules.length) {
        var submodules = q.submodules.map(function(item, i) {
            return _transfer(item, datas.submodules[i]);
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
    if (options.root && typeof options.root === 'object') {
        options.root._isVm = true;
    }
    var q = _compile(options.root || null, options.getQ, true);
    return function(loader) {
        var datas = _sendRequrest(q, loader);
        return _transfer(q, datas);
    }
};

