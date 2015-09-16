
var fs = require('fs');
var tpl = require('../index');

var html = fs.readFileSync(__dirname + '/test.html').toString();

//var tplCode = tpl.tplCode(html);
//console.log(tplCode);

var foo = tpl.compile(html);

console.log(foo({
    isShow: true,
    imgSrc: 'http://www.baidu.com/logo.gif',
    isRed: true,
    pwd: '123456',
    isCheck: false,
    attrs: {
        width: 50,
        height: 100
    }
}));


