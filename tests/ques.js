
var 
    ques = require('../ques');

// 编译单个页面
var page = ques.compile({
    name: 'index',
    root: __dirname + '/pages'
});

var req = {
    // 可以将global移至pages/对应的sync.js文件中
    global: function() {
        return new Promise(function(resolve, reject) {
            resolve({
                globalTitle: 'globalTitle from global',
                syncTitle: 'syncTitle from global'
            });
        });
    }
};

page(req)
    .then(function(html) {
        console.log('single page');
        console.log(html);
    })
    .catch(function(err) {
        console.log(err);
    });

return;
// 编译多个页面
var allPages = ques.compileAll({
    root: __dirname + '/pages'
});


Object.keys(allPages).forEach(function(name) {
    var req = {
        global: function() {
            return new Promise(function(resolve, reject) {
                resolve({
                    globalTitle: 'globalTitle from global',
                    syncTitle: 'syncTitle from global'
                });
            });
        }
    };
    allPages[name](req)
        .then(function(html) {
            console.log('multi page: ' + name);
            console.log(html);
        })
        .catch(function(err) {
            console.log(err);
        });
});

