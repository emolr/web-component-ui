const gulp = require("gulp")
const tasks = require("./gulp-tasks")
const path = require("path")

exports.run = function(opts) {
    const cwd = opts.directory
    const rootPath = path.resolve(process.mainModule.filename, '..', '..');
    const markdownGlob = [`${cwd}/**/*.md`, `${cwd}/readme.md`, `!${cwd}/dist/**/*.md`, `!${cwd}/node_modules/**/*.md`];

    gulp.task('clean', tasks.clean);

    gulp.task('copy:readme', tasks.copyReadmeFiles);
    gulp.task('copy:package-configuration', tasks.copyPackageFiles);

    gulp.task('compile:raw', tasks.compileRaw);
    gulp.task('compile:bundle', tasks.compileBundle);
    gulp.task('compile:module', tasks.compileModule);
    gulp.task('scss:trigger', tasks.triggerCompileFromScss);
    gulp.task('compile:markdown', tasks.markdownToJSON);
    gulp.task('compile:demo', tasks.compileDemo);

    gulp.task('watch:build', () => {
        gulp.watch([`${cwd}/**/!(*.spec)*.ts`, `!${cwd}/node_modules`, `!${cwd}/dist`], ['compile']);
        gulp.watch([`${cwd}/**/*.scss`, `!${cwd}/node_modules`, `!${cwd}/dist`], ['scss:trigger']);
        gulp.watch(markdownGlob, ['copy:readme', 'compile:markdown', 'compile:demo'])
    });

    gulp.task('compile', ['compile:bundle', 'compile:raw', 'compile:module', 'copy:readme', 'compile:markdown', 'compile:demo'])
    gulp.task('build', ['clean', 'compile', 'copy:package-configuration'])

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

    this.compile = async function compile(opts) {
        await taskPromise('build');
    }

    this.watch = async function watch(opts) {
        await taskPromise('watch:build');
    }

    return this
}