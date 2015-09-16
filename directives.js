
var $ = require('cheerio');

module.exports = {
    text: function(exp) {
        $(this.el).html('{{= ' + exp + ' }}');
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
        $(this.el).css(this.strings(tpl), '0');
    },
    'class': function(exp) {
        var arg = this.arg;
        if (arg) {
            var tpl = '{{ if (' + exp + ') { }} ' + arg + ' {{ } }}';
            $(this.el).addClass(this.strings(tpl));
        }
    },
    value: function(exp) {
        if (this.el.type === 'checkbox') {
            $(this.el).attr('checked', '{{= ' + exp + ' }}');
        } else {
            $(this.el).val('{{= ' + exp + ' }}');
        }
    },
    attr: function(exp) {
        var arg = this.arg;
        if (arg) {
            $(this.el).attr(arg, '{{= ' + exp + ' }}');
        }
    },
    src: function(exp) {
        $(this.el).attr('src', '{{= ' + exp + ' }}');
    }
};

