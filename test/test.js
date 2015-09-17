var tpl = require('../');
var fs = require('fs');
var path = require('path');

function compare(caseName) {
    var src = fs.readFileSync(path.join(__dirname, 'src', caseName + '.html'), 'utf-8');
    var expect = fs.readFileSync(path.join(__dirname, 'expect', caseName + '.html'), 'utf-8');
    tpl.tplCode(src).should.equal(expect);
}

describe('Q.tpl', function () {
    it('should able to use text directive', function () {
        compare('text');
    });
});


// var fs = require('fs');
// var tpl = require('../index');

// var html = fs.readFileSync(__dirname + '/test.html').toString();

// //var tplCode = tpl.tplCode(html);
// //console.log(tplCode);

// var foo = tpl.compile(html);

// console.log(foo({
//     isShow: true,
//     imgSrc: 'http://www.baidu.com/logo.gif',
//     isRed: true,
//     pwd: '123456',
//     isCheck: false,
//     size: 35,
//     attrs: {
//         width: 50,
//         height: 100
//     }
// }));


