const gulp = require("gulp")
const tasks = require("./gulp-tasks")
const path = require("path")

exports.run = function(opts) {
    const cwd = opts.directory
    const rootPath = path.resolve(process.mainModule.filename, '..', '..');

    gulp.task('clean', tasks.clean);

    gulp.task('copy:readme', tasks.copyReadmeFiles);
    gulp.task('copy:package-configuration', tasks.copyPackageFiles);

    gulp.task('compile:raw', tasks.compileRaw);
    gulp.task('compile:bundle', tasks.compileBundle);

    gulp.task('compile:module', tasks.compileModule);
    gulp.task('compile:demos', tasks.compileDemos);
    gulp.task('compile:demo-index', tasks.compileDemoIndex);

    gulp.task('watch:documentation', () => {
        gulp.watch(`${cwd}/**/*.md`, ['copy:readme', 'compile:demos', 'compile:demo-index'])
        gulp.watch(`${rootPath}/templates/**/*.hbs`, ['compile:demos', 'compile:demo-index'])
        gulp.watch(`${rootPath}/templates/**/*.scss`, ['compile:demos', 'compile:demo-index'])
    });
    gulp.task('watch:build', () => {
        gulp.watch([`${cwd}/src/**/*.scss`, `${cwd}/src/**/!(*.spec)*.ts`], ['compile']);
    });
    gulp.task('watch:both', ['watch:build', 'watch:documentation']);

    gulp.task('documentation', ['copy:readme', 'compile:demos', 'compile:demo-index'])
    gulp.task('compile', ['compile:bundle', 'compile:raw', 'compile:module'])
    gulp.task('build', ['clean', 'compile', 'copy:package-configuration'])
    gulp.task('both', ['build', 'documentation']);

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
    this.compileComponent = async function compileComponent(opts) {
        await taskPromise('build');
    }
    this.compileDocumentation = async function compileDocumentation(opts) {
        await taskPromise('documentation');
    }

    this.watch = async function watch(opts) {
        await taskPromise('watch:both');
    }
    this.watchComponent = async function watchComponent(opts) {
        await taskPromise('watch:build');
    }
    this.watchDocumentation = async function watchDocumentation(opts) {
        await taskPromise('watch:documentation');
    }

    return this
}