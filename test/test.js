
var fs = require('fs');
var tpl = require('../main');
var html = fs.readFileSync('./test.html').toString();

console.log(tpl.tplCode(html));

