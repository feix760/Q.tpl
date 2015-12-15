
var $ = require('cheerio');

function eq(exp) {
    return '{%{= ' + exp + ' }%}';
}

function tmp(exp) {
    return 'var tmp = ' + exp + ';';
}

function styleTpl(self, tpl) {
    $(self.el).css(self.vm.stringsFactory(tpl), 0);
}

function attrTpl(self, tpl) {
    $(self.el).attr(self.vm.stringsFactory(tpl), 0);
}

function styleParse(string) {
    var res = {};
    string.split(';').forEach(function (decl) {
        // ignore just space
        if (decl.trim()) {
            decl = decl.split(':');
            res[decl[0].trim()] = decl[1].trim();
        }
    });
    return res;
}

function styleToString(obj) {
    var res = [];
    Object.keys(obj).forEach(function (key) {
        res.push(key + ': ' + obj[key] + ';');
    });
    return res.join(' ');
}

module.exports = {
    // q-vm="name"
    // q-vm="__filterValue(__obj, {name: "name"})"
    vm: function(exp) {
        var info = JSON.parse(exp.replace(/^[^{]*/, '').replace(/[^}]*$/, ''));
        $(this.el).html(this.vm.addSubmodule({
            inline: true,
            name: info.name
        }));
    },
    text: function(exp) {
        $(this.el).html('{%{- ' + exp + ' }%}');
    },
    html: function(exp) {
        $(this.el).html(eq(exp));
    },
    show: function (exp) {
        if (this.el.attribs.style) {
            var obj = styleParse(this.el.attribs.style);
            if ('display' in obj) {
                delete obj['display'];
            }
            this.el.attribs.style = styleToString(obj);
        }
        var tpl = '{%{ if (' + exp + ') { }%}display: block;{%{ } else { }%}display: none;{%{ } }%}';
        styleTpl(this, tpl);
    },
    repeat: function(exp) {
        var $el = $(this.el);
        $el.before($el.toString());
        delete this.el.attribs['q-repeat'];
        this.el.attribs['q-remove'] = '';
        $el.before('{%{ var $$tmp = ' + exp + ';if($$tmp) { $$tmp.forEach(function(item) { with(item) { var __obj=item; }%}');
        $el.after('{%{ }});} }%}');
    },
    bg: function(exp) {
        var tpl = 'background: url(\'{%{= ' + exp + '}%}\')';
        styleTpl(this, tpl);
    },
    remove: function() {
        // do nothing
    },
    'class': function(exp) {
        var arg = this.arg;
        var $el = $(this.el);
        if (arg) {
            // remove class prevent the target class has existed
            $el.removeClass(arg);
            var tpl = '{%{ if (' + exp + ') { }%}' + arg + '{%{ } }%}';
            $(this.el).addClass(this.vm.stringsFactory(tpl));
        } else {
            $(this.el).addClass(this.vm.stringsFactory(eq(exp)));
        }
    },
    value: function(exp) {
        if ($(this.el).attr('type') === 'checkbox') {
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
                '{%{ ', 
                    tmp(exp),
                    'if (typeof tmp === "object" && tmp) {',
                        'for (var k in tmp) { }%}',
                            '{%{= k }%}="{%{= tmp[k] }%}" ',
                        '{%{ } ',
                    '}',
                ' }%}'
            ].join('');
            attrTpl(this, tpl);
        }
    },
    src: function(exp) {
        $(this.el).attr('src', eq(exp));
    }
};

