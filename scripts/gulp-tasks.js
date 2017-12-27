const gulp = require("gulp")
const chalk = require("chalk")
const inject = require('gulp-inject')
const sass = require('node-sass')
const sourcemaps = require('gulp-sourcemaps')
const del = require('del')
const postcss = require('postcss')
const autoprefixer = require('autoprefixer')
const markdown = require('gulp-marked-json')
const handlebars = require('handlebars')
const through = require('through2')
const frontMatter = require('front-matter')
const glob = require('glob')
const path = require('path')
const fs = require('fs-extra')
const marked = require('marked')
const Entities = require('html-entities').AllHtmlEntities
const entities = new Entities()
const postcssOptions = [ autoprefixer({ browsers: ['last 2 versions'] }) ]
const rootPath = path.resolve(process.mainModule.filename, '..', '..')
const cwd = process.cwd()
const ts = require("gulp-typescript")
const uglify = require('gulp-uglify-es').default;
const log = require('./utils').log;
const gulpSassInject = require('./gulp-sass-inject').gulpSassInject
const gulpBundle = require('./gulp-bundle').gulpBundle
const applyToStylesMap = require('./utils').applyToStylesMap
const updateTimestampFromStylesMap = require('./utils').updateTimestampFromStylesMap
const watch = require('gulp-watch')
const newer = require('gulp-newer');
const tsProjectRaw = ts.createProject({
    target: "es6",
    lib: ["es5", "es6", "dom", "es7", "esnext"],
    experimentalDecorators: true,
    moduleResolution: 'node'
})
const tsSource = `${cwd}/src/**/!(*.spec)*.ts`
const tsDist = 'dist/lib'
// let stylesMap = {};
const StylesMap = require('./services/styles-map.service');
const stylesMap = new StylesMap();

// add handlebars helpers
handlebars.registerHelper('list', function(items, options) {
    var out = "<ul>";
    for(var i=0, l=items.length; i<l; i++) {
      out = out + "<li>" + options.fn(items[i]) + "</li>";
    }
    
    return out;
});

// Export tasks
exports.clean = function clean() {
    return del.sync([`${cwd}/dist/`], {
        force: true
    })
}

exports.triggerCompileFromScss = function trigger() {
    return watch(`${cwd}/src/**/*.scss`, { ignoreInitial: true })
    .pipe(through.obj((input, enc, cb) => {
        stylesMap.updateTimestampFromStylesMap(input)
        cb(null, input)
    }))
}

exports.compileBundle = function compile() {
    return gulp.src(tsSource)
    .pipe(newer({
        dest: tsDist,
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
    .pipe(gulp.dest(tsDist))
    .pipe(through.obj((input, enc, cb) => {
        stylesMap.applyToStylesMap(input)
        log(`Finished compiling ${input.path}`, 2, 'Compile');
        cb(null, input)
    }))
}

exports.compileRaw = function compile() {
    return gulp.src(tsSource)
    .pipe(newer({
        dest: tsDist,
        ext: '.js'
    }))
    .pipe(sourcemaps.init())
    .pipe(tsProjectRaw())
    .pipe(gulpSassInject())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(tsDist))
    .pipe(through.obj((input, enc, cb) => {
        stylesMap.applyToStylesMap(input)
        log(`Finished compiling ${input.path}`, 2, 'Compile');
        cb(null, input)
    }))
}

exports.compileModule = function compile() {
    return gulp.src(tsSource)
    .pipe(newer({
        dest: tsDist,
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
    .pipe(gulp.dest(tsDist))
    .pipe(through.obj((input, enc, cb) => {
        stylesMap.applyToStylesMap(input)
        log(`Finished compiling ${input.path}`, 2, 'Compile');
        cb(null, input)
    }))
}

exports.copyReadmeFiles = function copyReadmeFiles() {
    return gulp.src(`${cwd}/src/**/*.md`)
        .pipe(gulp.dest(`${cwd}/dist/lib`))
        .pipe(through.obj((input, enc, cb) => {
            log(`${input.path} successfully copied`, 2, 'Documentation');
            cb(null, input)
        }))
}

exports.copyPackageFiles = function copyPackageFiles() {
    return gulp.src(`${cwd}/src/**/package.json`)
        .pipe(gulp.dest(`${cwd}/dist/lib`))
        .pipe(through.obj((input, enc, cb) => {
            log(`${input.path} successfully copied`, 2, 'Compile');
            cb(null, input)
        }))
}

exports.compileDemos = function compileDemos() {
    return gulp.src([`${cwd}/src/**/*.md`, `${cwd}/docs/**/*.md`, `${cwd}/readme.md`], {
        allowEmpty: true
    })
        .pipe(markdown({
            smartypants: true,
        }))
        .pipe(through.obj(function(input, enc, cb) {
            const srcFile = input;
            const replacer = (match, p1, p2, p3, p4, p5, p6) => {
                return `
                ${p1}${entities.decode(p6)}${p3}
                <pre>
                    <code class="lang-html">${p6}</code>
                </pre>
                `
            };
            const data = input.contents.toString();
            let parsedMarkdown = JSON.parse(data);
            parsedMarkdown.body = parsedMarkdown.body.replace(/<!--\n```([^]*?)(<next-code-block[^]*?<\/next-code-block>)([^]*?)(```\n-->)([^]*?<pre><code class="lang-html">)([^]*?)<\/code><\/pre>/g, replacer);

            const compileHandlebars = new Promise((resolve) => {
                gulp.src(`${rootPath}/templates/component-index.hbs`).pipe(through.obj(function(templateInput, enc, cb) {
                    let template = handlebars.compile(templateInput.contents.toString());
                    const result = template(parsedMarkdown);
                    const file = templateInput;
                    file.contents = new Buffer(result);
                    resolve(file);
                }));
            })

            compileHandlebars.then(res => {
                let file = res;
                let newPath;
                let filename;

                if (input.path.match(/src/)) {
                    newPath = input.path.replace(/src/, path.join('dist', 'lib'));
                } else if (input.path.match(/docs/)) {
                    fs.ensureDirSync(path.join(cwd, 'dist', 'docs'))
                    newPath = input.path.replace(/docs/, path.join('dist', 'docs'));
                } else if (!path.parse(input.relative).dir) {
                    const pathObj = path.parse(input.path);
                    newPath = path.join(pathObj.dir, 'dist', pathObj.base)
                }
                
                newPath = newPath.replace(/.json/, '.html')
                file.path = newPath;

                cb(null, file);
            }).catch(err => {log(`Error: ${err}`, 4, 'Bundle')})
        }))
        .pipe(inject(gulp.src([`${rootPath}/templates/**/*.scss`], {
            cwd: `${rootPath}/templates/`
        }), {
            starttag: '/* inject:{{path}} */',
            endtag: '/* endinject */',
            transform: function (filePath, file) {
                const css = sass.renderSync({
                    data: file.contents.toString('utf8'),
                    outputStyle: 'expanded',
                    includePaths: [`${rootPath}/templates/styles`],
                }).css.toString('utf8');

                return postcss(postcssOptions).process(css).css;
            }
        }))
        .pipe(through.obj((input, enc, cb) => {
            fs.ensureDirSync(path.parse(input.path).dir)
            fs.writeFile(input.path, input.contents, (err) => {
                if (err) {
                    log(`Error: ${err}`, 4, 'Documentation');
                }
            });
            cb(null, input)
        }))
}

exports.compileDemoIndex = function compileDemoIndex() {
    getComponentPaths = () => {
        return new Promise(resolve => {
            glob(`${cwd}/src/**/*.md`, (error, files) => {
                let filepaths = files.map(f => {
                    const relativePath = f.split('src')[1];
                    return {
                        path: path.resolve(f),
                        relative: path.normalize(path.join('/', 'lib', relativePath))
                    };
                });
                resolve(filepaths);
            });
        });
    }

    getDocsPaths = () => {
        return new Promise(resolve => {
            glob(`${cwd}/docs/**/*.md`, (error, files) => {
                let filepaths = files.map(f => {
                    const relativePath = f.split(cwd)[1];
                    return {
                        path: path.resolve(f),
                        relative: path.normalize(relativePath)
                    };
                });
                resolve(filepaths);
            });
        });
    }

    parseReadme = (files) => {
        return new Promise(resolve => {
            let configs = files.map(file => {
                const fsFile = fs.readFileSync(file.path, 'utf8')
                const parsed = frontMatter(fsFile).attributes
                const matchedTitle = JSON.stringify(fsFile).match(/# (.+?)\\n/);

                if (!parsed.title && matchedTitle) {
                    parsed.title = matchedTitle[1];
                } else if (!parsed.title && !matchedTitle) {
                    parsed.title = JSON.stringify(fsFile).match(/# (.+?.*)/)[1].replace(/.$/, '')
                } else if (parsed.title){
                    parsed.title = parsed.title;
                }

                let componentPath = file.relative.replace(/src/, 'dist/lib')
                componentPath = componentPath.replace(/.md/, '.html')
                componentPath = '.' + componentPath;
                parsed.demo = componentPath;
                return parsed
            });
            resolve(configs)
        });
    }

    async function handleReadmeFiles() {
        const components = await getComponentPaths();
        const docs = await getDocsPaths();
        const componentConfigs = await parseReadme(components)
        const docsConfigs = await parseReadme(docs).catch(err => {
            log(`Error: ${err}`, 4, 'Documentation');
        })
        
        return {
            components: componentConfigs,
            docs: docsConfigs
        };
    }

    handleReadmeFiles().then(res => {
        data = {};
        data.components = res.components;
        data.docs = res.docs;

        gulp.src(`${rootPath}/templates/index.hbs`).pipe(through.obj(function(input, enc, cb) {
            let template = handlebars.compile(input.contents.toString());
            const result = template(data);
            const file = input;
            file.path = file.path.replace(/index.hbs/, 'demo.html')
            file.contents = new Buffer(result);
            cb(null, file);
        }))
        .pipe(inject(gulp.src([`${rootPath}/templates/**/*.scss`]), {
            starttag: '/* inject:{{path}} */',
            endtag: '/* endinject */',
            relative: true,
            transform: function (filePath, file) {
                const css = sass.renderSync({
                    data: file.contents.toString('utf8'),
                    outputStyle: 'expanded',
                    includePaths: [`${rootPath}/templates/styles`],
                }).css.toString('utf8');

                return postcss(postcssOptions).process(css).css;
            }
        }))
        .pipe(gulp.dest(`${cwd}/dist`))
    })
}