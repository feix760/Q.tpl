
var fs = require('fs');
var Promise = require('promise');
var QLoader = require('../loader');

var q = QLoader.compile({
    root: 'root',
    getQ: function(id) {
        if (id === 'submodule') {
            return {
                raw: '<h1 q-text="text"></h1>',
                data: function(loader) {
                    return Promise.resolve({
                        text: 'hello world submodule'
                    });
                }
            };
        }
        return {
            raw: fs.readFileSync(__dirname + '/test.html').toString(),
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
        };
    }
});

var loader = {};
q(loader).done(function(html) {
    console.log(html);
});

