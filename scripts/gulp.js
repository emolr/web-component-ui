const gulp = require("gulp")
const tasks = require("./gulp-tasks")

exports.run = function(opts) {
    const cwd = opts.directory

    gulp.task('clean', tasks.clean)
    gulp.task('compile:test', tasks.compileTests)
    gulp.task('compile:dev', tasks.compileDev)
    gulp.task('compile:prod', tasks.compileProduction)
    gulp.task('copy:readme', tasks.copyReadmeFiles)
    gulp.task('compile:demos', tasks.compileDemos)
    gulp.task('compile:demo-index', tasks.compileDemoIndex)

    gulp.task('compile', ['compile:test', 'copy:readme', 'compile:demos', 'compile:demo-index'])
    gulp.task('build:dev', ['clean', 'compile:dev', 'compile'])
    gulp.task('build:prod', ['clean', 'compile:prod', 'compile'])

    gulp.task('init:watch', () => {
        gulp.watch(`${cwd}/**/*.scss`, ['compile:dev'])
        gulp.watch(`${cwd}/**/!(*.spec)*.ts`, ['compile:dev'])
        gulp.watch(`${cwd}/**/*.spec.ts`, ['compile:test'])
        gulp.watch(`${cwd}/**/README.md`, ['copy:readme', 'compile:demos', 'compile:demo-index'])
    })

    gulp.task('watch', ['init:watch']);

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
            await taskPromise('build:prod')
        } else {
            console.log('Development build started')
            await taskPromise('build:dev')
        }
    }

    this.watch = async function watch(opts) {
        console.log('Started watching')
        taskPromise('build:dev').then(() => {
            taskPromise('watch')
        })
    }

    return this
}