const gulp = require("gulp")
const sourcemaps = require('gulp-sourcemaps')
const del = require('del')
const markdown = require('gulp-marked-json')
const through = require('through2')
const frontMatter = require('front-matter')
const glob = require('glob')
const path = require('path')
const fs = require('fs-extra')
const rootPath = path.resolve(process.mainModule.filename, '..', '..')
const cwd = process.cwd()
const ts = require("gulp-typescript")
const uglify = require('gulp-uglify-es').default;
const log = require('./utils').log;
const gulpSassInject = require('./gulp-sass-inject')
const gulpBundle = require('./gulp-bundle').gulpBundle
const applyToStylesMap = require('./utils').applyToStylesMap
const updateTimestampFromStylesMap = require('./utils').updateTimestampFromStylesMap
const newer = require('gulp-newer');
const demoUtils = require('./gulp-demo-utils')
const tsSource = [`${cwd}/**/!(*.spec)*.ts`, `!${cwd}/dist**/*`, `!${cwd}/node_modules/**/*`]
const markdownGlob = [`${cwd}/**/*.md`, `${cwd}/readme.md`, `!${cwd}/dist/**/*.md`, `!${cwd}/node_modules/**/*.md`];
const distDir = 'dist'
const StylesMap = require('./services/styles-map.service');
const stylesMap = new StylesMap();
const tsProjectRaw = ts.createProject({
    target: "es6",
    lib: ["es5", "es6", "dom", "es7", "esnext"],
    experimentalDecorators: true,
    moduleResolution: 'node'
})

exports.clean = function clean() {
    return del.sync([`${cwd}/dist/`], {
        force: true
    })
}

exports.triggerCompileFromScss = function trigger() {
    return gulp.src(`${cwd}/src/**/*.scss`)
    .pipe(through.obj((input, enc, cb) => {
        stylesMap.updateTimestampFromStylesMap(input)
        cb(null, input)
    }))
}

exports.compileBundle = function compile() {
    return gulp.src(tsSource)
    .pipe(newer({
        dest: distDir,
        ext: '.js'
    }))
    .pipe(sourcemaps.init())
    .pipe(gulpBundle())
    .pipe(gulpSassInject())
    .pipe(uglify({
        ecma: 6,
        compress: true
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(distDir))
    .pipe(through.obj((input, enc, cb) => {
        stylesMap.applyToStylesMap(input)
        log(`Finished compiling ${input.path}`, 2, 'Compile');
        cb(null, input)
    }))
}

exports.compileRaw = function compile() {
    return gulp.src(tsSource)
    .pipe(newer({
        dest: distDir,
        ext: '.js'
    }))
    .pipe(sourcemaps.init())
    .pipe(tsProjectRaw())
    .pipe(gulpSassInject())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(distDir))
    .pipe(through.obj((input, enc, cb) => {
        stylesMap.applyToStylesMap(input)
        log(`Finished compiling ${input.path}`, 2, 'Compile');
        cb(null, input)
    }))
}

exports.compileModule = function compile() {
    return gulp.src(tsSource)
    .pipe(newer({
        dest: distDir,
        ext: '.js'
    }))
    .pipe(sourcemaps.init())
    .pipe(gulpBundle({
        format: 'umd',
        type: 'module',
        sourceMap: true
    }))
    .pipe(gulpSassInject())
    .pipe(uglify({
        ecma: 6,
        compress: true
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(distDir))
    .pipe(through.obj((input, enc, cb) => {
        stylesMap.applyToStylesMap(input)
        log(`Finished compiling ${input.path}`, 2, 'Compile');
        cb(null, input)
    }))
}

exports.copyReadmeFiles = function copyReadmeFiles() {
    return gulp.src(markdownGlob)
        .pipe(through.obj((input, enc, cb) => {
            cb(null, input)
        }))
        .pipe(newer({
            dest: 'dist',
            ext: '.md',
        }))
        .pipe(gulp.dest('dist'))
        .pipe(through.obj((input, enc, cb) => {
            log(`${input.path} successfully copied`, 2, 'Copy');
            cb(null, input)
        }))
}

exports.copyPackageFiles = function copyPackageFiles() {
    return gulp.src(`${cwd}/src/**/package.json`)
        .pipe(gulp.dest(`${cwd}/dist/`))
        .pipe(through.obj((input, enc, cb) => {
            log(`${input.path} successfully copied`, 2, 'Compile');
            cb(null, input)
        }))
}

exports.markdownToJSON = function markdownToJSON() {
    return gulp.src(markdownGlob, { allowEmpty: true })
        .pipe(markdown({
            smartypants: true,
        }))
        .pipe(demoUtils.replaceExample())
        .pipe(newer({
            dest: 'dist',
            ext: '.json'
        }))
        .pipe(gulp.dest('dist'))
        .pipe(through.obj((input, enc, cb) => {
            log(`${input.path} successfully compiled`, 2, 'Compile');
            cb(null, input)
        }))
}

exports.compileDemo = function compileDemo() {
    return gulp.src(markdownGlob, { allowEmpty: true })
        .pipe(markdown({
            smartypants: true,
        }))
        .pipe(demoUtils.replaceExample())
        .pipe(demoUtils.compileHandlebarsTemplate(`${rootPath}/templates/component-index.hbs`))
        .pipe(gulpSassInject({
            cwd: rootPath,
            includePath: path.join(rootPath, 'templates', 'styles'),
            sourceMap: false
        }))
        .pipe(newer({
            dest: 'dist',
            ext: '.html'
        }))
        .pipe(gulp.dest('dist'))
        .pipe(through.obj((input, enc, cb) => {
            log(`${input.path} successfully compiled`, 2, 'Compile');
            cb(null, input)
        }))
}