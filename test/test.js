var tpl = require('../');
var fs = require('fs');
var path = require('path');

function compare(caseName) {
    var src = fs.readFileSync(path.join(__dirname, 'src', caseName + '.html'), 'utf-8');
    var expect = fs.readFileSync(path.join(__dirname, 'expect', caseName + '.html'), 'utf-8');
    tpl.tplCode({raw: src}).should.equal(expect);
}

describe('directive', function () {
    describe('text', function () {
        it('should able to use text directive', function () {
            compare('text');
        });

        it('should remove the text node', function () {
            compare('text-has-text')
        });
    });

    describe('class', function () {
        it('should able to use class directive', function () {
            compare('class');
        });

        it('should remove the class when exists', function () {
            compare('class-exist');
        });

        it('should able to use class directive without arugument', function () {
            compare('class-without-arg');
        });
    });

    describe('show', function () {
        it('should able to use show directive', function () {
            compare('show');
        });

        it('should remove the display style when using show directive', function () {
            compare('show-has-style');
        });
    });
    
    // it('should able to use value directive', function () {
    //     compare('value');
    // });
});
