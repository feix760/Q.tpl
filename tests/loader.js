
var _ = require('lodash');
var fs = require('fs');
var tplLoader = require('../loader');

var q = tplLoader.compile({
    root: {
        raw: fs.readFileSync(__dirname + '/loader.html').toString(),
        filters: {
            insert: function(list, val) {
                return [val].concat(list);
            },
            length: function(list) {
                return list.length;
            }
        },
        data: function(loader) {
            return Promise.resolve({
                isShow: true,
                imgSrc: 'http://www.baidu.com/logo.gif',
                isRed: true,
                pwd: '123456',
                isCheck: false,
                size: 35,
                list: [23, 3, 22],
                attrs: {
                    width: 50,
                    height: 100
                }
            });
        }
    },
    // compile invoke
    getQ: function(vm) {
        return {
            raw: '<div><h1 q-text="text"></h1><content></content></div>',
            data: function(loader) {
                return Promise.resolve({
                    text: 'hello world submodule'
                });
            }
        };
    }
});

var loader = {};
q(loader).then(function(html) {
    console.log(html);
});

