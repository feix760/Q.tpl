
var fs = require('fs');
var tpl = require('../index');

var html = fs.readFileSync(__dirname + '/test.html').toString();

var foo = tpl.compile({
    raw: html,
    filters: {
        insert: function(list, val) {
            return [val].concat(list);
        },
        length: function(list) {
            return list.length;
        }
    }
});

console.log(foo({
    isShow: true,
    imgSrc: 'http://www.baidu.com/logo.gif',
    isRed: true,
    pwd: '123456',
    isCheck: false,
    size: 35,
    list: [23, 3, 22],
    _vm: {
        model2: '<h2>hello</h2>',
    },
    attrs: {
        width: 50,
        height: 100
    }
}));


