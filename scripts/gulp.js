const gulp = require("gulp")
const tasks = require("./gulp-tasks")
const path = require("path")

exports.run = function(opts) {
    const cwd = opts.directory
    const rootPath = path.resolve(process.mainModule.filename, '..', '..');

    gulp.task('clean', tasks.clean)
    gulp.task('compile:bundle', tasks.compileBundle)
    gulp.task('compile:raw', tasks.compileRaw)
    gulp.task('compile:module', tasks.compileModule)
    gulp.task('copy:readme', tasks.copyReadmeFiles)
    gulp.task('compile:demos', tasks.compileDemos)
    gulp.task('compile:demo-index', tasks.compileDemoIndex)
    gulp.task('copy:package-configuration', tasks.copyPackageFiles)

    gulp.task('documentation', ['copy:readme', 'compile:demos', 'compile:demo-index'])
    gulp.task('compile', ['compile:bundle', 'compile:raw', 'compile:module'])
    gulp.task('build', ['clean', 'compile', 'copy:package-configuration'])
    gulp.task('both', ['build', 'documentation']);

    gulp.task('watch:documentation', () => {
        gulp.watch(`${cwd}/**/*.md`, ['copy:readme', 'compile:demos', 'compile:demo-index'])
        gulp.watch(`${rootPath}/templates/**/*.hbs`, ['compile:demos', 'compile:demo-index'])
        gulp.watch(`${rootPath}/templates/**/*.scss`, ['compile:demos', 'compile:demo-index'])
    })

    gulp.task('watch:build', () => {
        gulp.watch(`${cwd}/src/**/*.scss`, ['compile'])
        gulp.watch(`${cwd}/src/**/!(*.spec)*.ts`, ['compile'])
        gulp.watch(`${rootPath}/templates/**/*.hbs`, ['compile:demos', 'compile:demo-index'])
        gulp.watch(`${rootPath}/templates/**/*.scss`, ['compile:demos', 'compile:demo-index'])
    })

    gulp.task('watch:both', () => {
        gulp.watch(`${cwd}/src/**/*.scss`, ['compile'])
        gulp.watch(`${cwd}/src/**/!(*.spec)*.ts`, ['compile'])
        gulp.watch(`${cwd}/**/*.md`, ['copy:readme', 'compile:demos', 'compile:demo-index'])
        gulp.watch(`${rootPath}/templates/**/*.hbs`, ['compile:demos', 'compile:demo-index'])
        gulp.watch(`${rootPath}/templates/**/*.scss`, ['compile:demos', 'compile:demo-index'])
    })

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
        console.log('Compile started')
        await taskPromise('build');
        // if (!opts.documentation) {
        //     await taskPromise('build').then(() => {}).catch(err => {
        //         console.log(err)
        //     })
        // } else {
        //     await taskPromise('both').then(() => {}).catch(err => {
        //         console.log(err)
        //     })
        // }
    }
    this.compileComponent = async function compileComponent(opts) {
        console.log('buildComponent started');
        await taskPromise('build');
    }
    this.compileDocumentation = async function compileDocumentation(opts) {
        console.log('buildDocumentation started');
        await taskPromise('documentation');
    }

    this.watch = async function watch(opts) {
        console.log('watch started');
        await taskPromise('watch:both');
        // console.log('Started watching')
        // if (opts.compile) {
        //     if (opts.documentation) {
        //         taskPromise('both').then(() => {
        //             taskPromise('watch:both').catch(err => {
        //                 console.log(err)
        //             })
        //         }).catch(err => {
        //             console.log(err)
        //         })
        //     } else {
        //         taskPromise('build').then(() => {
        //             taskPromise('watch:build').catch(err => {
        //                 console.log(err)
        //             })
        //         }).catch(err => {
        //             console.log(err)
        //         })
        //     }
        // } else {
        //     if (opts.documentation) {
        //         taskPromise('documentation').then(() => {
        //             taskPromise('watch:documentation').catch(err => {
        //                 console.log(err)
        //             })
        //         }).catch(err => {
        //             console.log(err)
        //         })
        //     }
        // }
    }
    this.watchComponent = async function watchComponent(opts) {
        console.log('watchComponent started');
        await taskPromise('watch:build');
    }
    this.watchDocumentation = async function watchDocumentation(opts) {
        console.log('watchDocumentation started');
        await taskPromise('watch:documentation');
    }

    return this
}