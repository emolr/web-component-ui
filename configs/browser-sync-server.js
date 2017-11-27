const browserSync = require('browser-sync').create();

exports.init = function(cwd) {
    browserSync.init({
        server: `${cwd}/dist`,
        index: `demo.html`,
        files: [`${cwd}/dist/**/*`]
    })
}