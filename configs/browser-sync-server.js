const browserSync = require('browser-sync').create();

exports.init = function(cwd, index) {
    let startIndex = `demo.html`;
    
    if (index) {
        startIndex = index.replace(/.md/, '.html')
    }

    setTimeout(() => {
        browserSync.init({
            server: `${cwd}/dist`,
            index: startIndex,
            files: [`${cwd}/dist/**/*.*`],
            notify: false,
            reloadDebounce: 400
        })
    }, 2000)
}