const gulp = require("gulp")
const tasks = require("./gulp-tasks");
const handlebars = require('handlebars');
const handlebarsHelpers = require('./handlebars-helpers')

exports.run = function(opts) {
    const cwd = opts.directory;
    
    // Register handlebars helpers
    handlebars.registerHelper('list', handlebarsHelpers.list);

    const buildDev = function(cwd) {
        return Promise.all([
            tasks.compileDev(cwd),
            tasks.copyReadmeFiles(cwd),
            tasks.compileDemos(cwd)
        ]);
    }
    

    this.build = async function build(opts) {
        if (typeof opts !== 'undefined' && opts.production) {
            console.log('Production build started')
        } else {
            console.log('Development build started')
            await buildDev(cwd);
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