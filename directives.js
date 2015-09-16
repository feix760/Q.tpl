
var $ = require('cheerio');

function eq(exp) {
    return '{{= ' + exp + ' }}';
}

function tmp(exp) {
    return 'var tmp = ' + exp + ';';
}

module.exports = {
    text: function(exp) {
        $(this.el).html(eq(exp));
    },
    //if: function(exp) {
        //$(this.el).before('{{ if (' + exp + ') { }}');
        //$(this.el).after('{{ } }}');
    //},
    //repeat: function(exp) {
        //$(this.el).before('{{ _.each(' + exp + ', function(vm, k) {  }}');
        //$(this.el).after('{{ });  }}');
    //},
    show: function (exp) {
        var tpl = '{{ if (' + exp + ') { }} display: block; {{ } }}';
        $(this.el).css(this.strings(tpl), 0);
    },
    'class': function(exp) {
        var arg = this.arg;
        if (arg) {
            var tpl = '{{ if (' + exp + ') { }} ' + arg + ' {{ } }}';
            $(this.el).addClass(this.strings(tpl));
        } else {
            $(this.el).addClass(this.strings(eq(exp)));
        }
    },
    value: function(exp) {
        if (this.el.type === 'checkbox') {
            $(this.el).attr('checked', eq(exp));
        } else {
            $(this.el).val(eq(exp));
        }
    },
    attr: function(exp) {
        var arg = this.arg;
        if (arg) {
            if (arg !== 'style') {
                $(this.el).attr(arg, eq(exp));
            }
        } else {
            var tpl = [
                '{{ ', 
                    tmp(exp),
                    'if (typeof tmp === "object" && tmp) {',
                        'for (var k in tmp) { }}',
                            '{{= k }}={{= tmp[k] }} ',
                        '{{ } ',
                    '}',
                ' }}'
            ].join('');
            $(this.el).attr(this.strings(tpl), 0);
        }
    },
    src: function(exp) {
        $(this.el).attr('src', eq(exp));
    }
};

