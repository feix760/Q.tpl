
var fs = require('fs');
var tpl = require('../index');

var html = fs.readFileSync(__dirname + '/test.html').toString();

console.log(tpl.tplCode(html));

