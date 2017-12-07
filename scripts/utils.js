const sass = require('node-sass')
const postcss = require('postcss')
const autoprefixer = require('autoprefixer')
const postcssOptions = [ autoprefixer({ browsers: ['last 2 versions'] }) ]
const path = require('path')
const fs = require('fs-extra')
const rollup = require('rollup')
const rollupTypescript = require('rollup-plugin-typescript');
const typescript = require('typescript')
const chalk = require("chalk")

exports.compileStyle = function(options) {
    const opts = Object.assign({
        code: '',
        sourceMap: false,
        cwd: process.cwd()
    }, options)

    try {
        const css = sass.renderSync({
            data: opts.code,
            outputStyle: 'expanded',
            includePaths: [ `${opts.cwd}` ],
            sourceMap: opts.sourceMap,
            sourceMapEmbed: opts.sourceMap
        }).css.toString('utf8');

        return postcss(postcssOptions).process(css).css;
    } catch(err) {
        console.log(err)
        return;
    }
}

exports.injectStyle = function(options) {
    let opts = Object.assign({
        cwd: process.cwd(),
        code: '',
        sourceMap: false,
        regex: /@style\('([^]*?)'\)/g
    }, options)
    return opts.code.replace(opts.regex, (match, stylePath) => {
        let scss = '';

        try {
            scss = fs.readFileSync(path.resolve(`${opts.cwd}/${stylePath}`), {encoding: 'utf8'})
        } catch(err) {
            console.log(err)
        }
        
        if (scss !== '') {
            return this.compileStyle({
                code: scss,
                sourceMap: opts.sourceMap,
                cwd: opts.cwd
            })
        } else {
            return;
        }
    })
}

exports.compileBundle = function(input) {
    return new Promise(resolve => {
        rollup.rollup({
            input: input.path,
            plugins: [
                rollupTypescript({
                    typescript: typescript,
                    target: "es6",
                    lib: ["es5", "es6", "dom", "es7", "esnext"]
                })
            ]
        }).then(res => {
            res.generate({
                format: 'es',
                sourcemaps: true
            }).then(code => {
                input.contents = new Buffer(this.injectStyle({code: code.code}));
                input.path = input.path.replace(/([^]*?)(src)([^]*)(.ts)/g, (match, p1, p2, p3, p4) => {
                    return `${p1}dist/lib${p3}.bundle.js`
                });
                console.log(chalk`{green Finished compiling ${input.path}}`)
                resolve(input)
            });
        }).catch(err => {
            console.log(chalk`{red ${err}}`)
            resolve(null)
        })
    })
}