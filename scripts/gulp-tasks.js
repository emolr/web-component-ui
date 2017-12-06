const gulp = require("gulp")
const rollup = require('rollup');
const rollupTypescript = require('rollup-plugin-typescript');
const inject = require('gulp-inject')
const sass = require('node-sass')
const typescript = require('typescript');
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
const cwdRelative = cwd.split('/')

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

exports.compile = function compile() {
    return gulp.src(`${cwd}/src/**/!(*.spec)*.ts`)
        .pipe(through.obj((input, enc, cb) => {
            let file = input;
            const dir = path.dirname(input.path);
            let tempPath = input.path.replace(/src/, 'dist/lib');
            let newPath = tempPath.replace(/\.ts/, '.js');

            const replaceStyle = (match, p1) => {
                let styleFile = '';
                try {
                    styleFile = fs.readFileSync(path.resolve(`${cwd}/${p1}`), {encoding: 'utf8'});
                } catch(err) {
                    console.log(err)
                }

                if (styleFile !== '') {
                    try {
                        const css = sass.renderSync({
                            data: styleFile,
                            outputStyle: 'expanded',
                            includePaths: [ `${cwd}` ],
                            sourceMap: true,
                            sourceMapEmbed: false
                        }).css.toString('utf8');

                        return postcss(postcssOptions).process(css).css;
                    } catch(err) {
                        console.log(err)
                    }
                }
                return '';
            };
            
            const bundle = rollup.rollup({
                input: input.path,
                plugins: [
                    rollupTypescript({
                        typescript: typescript
                    })
                ]
            }).then(res => {
                res.generate({
                    format: 'es',
                    sourcemaps: true
                }).then(code => {
                    let generatedCode = code.code;
                    let newCode = generatedCode.replace(/@style\('([^]*?)'\)/g, replaceStyle)
                    file.path = newPath;
                    file.contents = new Buffer(newCode);

                    fs.ensureFileSync(file.path, err => {
                        console.log(err);
                    })
        
                    fs.writeFile(file.path, file.contents, (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });

                    cb(null, file)
                });
            });
        }))
}

exports.copyReadmeFiles = function copyReadmeFiles() {
    return gulp.src(`${cwd}/src/**/*.md`)
        .pipe(gulp.dest(`${cwd}/dist/lib`))
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
                    newPath = input.path.replace(/src/, 'dist/lib');
                } else if (input.path.match(/docs/)) {
                    fs.ensureDirSync(`${cwd}/dist/docs`)
                    newPath = input.path.replace(/docs/, 'dist/docs');
                } else if (!input.relative.match(/\//)) {
                    pathArray = input.path.split('/');
                    pathArray.splice(pathArray.length - 1, 0, 'dist');
                    fileName = pathArray[pathArray.length - 1];
                    newPath = pathArray.join('/');
                }
                
                newPath = newPath.replace(/.json/, '.html')
                file.path = newPath;

                cb(null, file);
            }).catch(err => {console.log(err)})
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
            fs.writeFile(input.path, input.contents, (err) => {
                if (err) {
                    console.log(err);
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
                        relative: '/lib' + relativePath
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
                        relative: relativePath
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
            console.log(err)
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