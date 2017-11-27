const gulp = require("gulp")
const tasks = require("./gulp-tasks");
const handlebars = require('handlebars');
const handlebarsHelpers = require('./handlebars-helpers')

exports.run = function(opts) {
    const cwd = opts.directory;
    
    // Register handlebars helpers
    handlebars.registerHelper('list', handlebarsHelpers.list);

    gulp.task('compile:dev', tasks.compileDev);
    gulp.task('copy:readme', tasks.copyReadmeFiles);
    gulp.task('compile:demos', tasks.compileDemos);

    gulp.task('build:dev', ['compile:dev', 'copy:readme', 'compile:demos'])

    // const buildDev = function(cwd) {
    //     return Promise.all([
    //         tasks.compileDev(cwd),
    //         tasks.copyReadmeFiles(cwd),
    //         tasks.compileDemos(cwd)
    //     ]);
    // }

    const taskPromise = (id) => {
        return new Promise((resolve, reject) => {
            gulp.start(id, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }
    

    this.build = async function build(opts) {
        if (typeof opts !== 'undefined' && opts.production) {
            console.log('Production build started')
        } else {
            console.log('Development build started')
            await taskPromise('build:dev');
        }
    }

    this.watch = function watch(opts) {
        if (typeof opts !== 'undefined' && opts.production) {
            console.log('Production is watching')
        } else {
            console.log('Development is watching')
        }
    }

    return this;
}