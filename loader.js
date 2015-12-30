var _ = require('lodash');
var Qtpl = require('./index');

function _compile(vmInfo, getQ) {
    var vm = null;
    if (vmInfo) {
        vmInfo = typeof vmInfo === 'string' 
            ? {name: vmInfo} : _.extend({}, vmInfo);
        vmInfo = vmInfo.raw ? vmInfo : _.extend(vmInfo, getQ(vmInfo));
        vm = Qtpl.compile(vmInfo).vm;
    }

    if (!vm) {
        console.warn('could not get Q: ' + JSON.stringify(vmInfo));
        return null;
    }
    vm.submodules = vm.submodules.map(function(item) {
        return _compile(item, getQ);
    });
    return vm;
}

// 把所有的请求全发出去
function _sendRequrest(vm, loader) {
    var data = mergeData(vm.rawData, loader.global, vm.data)(loader);
    data.submodules = vm.submodules.map(function(item) {
        // 可以通过loader共享数据
        return _sendRequrest(item, loader);
    });
    return data;
}

/**
 * 合并数据
 * @param {..Object|function(Object):Object|function(Object):Promise} args
 * @return {function(Object):Promise}
 */
function mergeData() {
    var args = [].slice.call(arguments);
    return function(loader) {
        return Promise.all(
                args.map(function(data) {
                    return adaptedData(data || {})(loader);
                })
            )
            .then(function(datas) {
                datas.unshift({});
                return _.extend.apply(_, datas);
            });
    };
}

/**
 * 适配数据
 * @param {Object|function(Object):Object|function(Object):Promise} data
 * @return {function(Object):Promise}
 */
function adaptedData(data) {
    return function(loader) {
        if (typeof data === 'function') {
            data = data(loader);
        } else {
            data = new Promise(function(resolve, reject) {
                resolve(data);
            });
        }
        return data && typeof data.then === 'function'  // 判断是不是Promise
            ? data
            : new Promise(function(resolve, reject) {
                resolve(data);
            });
    }
}

// 后序遍历渲染
function _transfer(vm, datas) {
    var subHtml = [];
    function afterChildren() {
        var tplData = {
            __vm: vm.vmInfo,
            __subHtml: subHtml
        };
        return datas.then(function(data) {
            return vm.tplFun(_.extend(data, tplData));
        }, function() {
            // 保准一定success
            return Promise.resolve(vm.tplFun(tplData));
        });
    }
    if (vm.submodules.length) {
        var submodules = vm.submodules.map(function(item, i) {
            return _transfer(item, datas.submodules[i]);
        });
        // all(submodules) 不会fail
        return Promise.all(submodules).then(function(htmlList) {
            subHtml = htmlList;
            return afterChildren();
        });
    } else {
        return afterChildren();
    }
}

exports.compile = function(options) {
    options = options || {};
    if (typeof options.root === 'object' && options.root) {
        options.root.name = options.root.name || '_root';
    }
    var vm = _compile(options.root || '_root', options.getQ);
    return function(loader) {
        var datas = _sendRequrest(vm, loader);
        return _transfer(vm, datas);
    }
};

