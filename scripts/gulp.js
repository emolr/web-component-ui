const gulp = require('gulp');

exports.run = function(opts) {
    const cwd = opts.directory;
    
    gulp.task('compile:dev', () => {
        gulp.src(`${cwd}/src/**/*`)
        .pipe(gulp.dest(`${cwd}/lib`))
    })

    gulp.task('build:dev', ['compile:dev'])

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
            await taskPromise('build:dev')
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


// gulp.task('task', function () {
//     return Promise.all([
//       new Promise(function(resolve, reject) {
//         gulp.src(src + '/*.md')
//           .pipe(plugin())
//           .on('error', reject)
//           .pipe(gulp.dest(dist))
//           .on('end', resolve)
//       }),
//       new Promise(function(resolve, reject) {
//         gulp.src(src + '/*.md')
//           .pipe(plugin())
//           .on('error', reject)
//           .pipe(gulp.dest(dist))
//           .on('end', resolve)
//       })
//     ]).then(function () {
//       // Other actions
//     });
//   });