const browserSync = require('browser-sync').create();

exports.init = function(cwd) {
    setTimeout(() => {
        browserSync.init({
            server: `${cwd}/dist`,
            index: `demo.html`,
            files: [`${cwd}/dist/**/*.js`, `${cwd}/dist/**/*.html`],
            notify: false,
            reloadDebounce: 400
        })
    }, 2000)
}