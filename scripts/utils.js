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
const rollupResolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");

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
            includePaths: [ path.resolve(`${opts.cwd}`) ],
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

exports.compileBundle = function(options) {
    const opts = Object.assign({
        file: null,
        format: 'iife',
        type: 'bundle',
        name: ''
    }, options)

    return new Promise(resolve => {
        rollup.rollup({
            input: opts.file.path,
            plugins: [
                rollupTypescript({
                    typescript: typescript,
                    target: "es6",
                    lib: ["es5", "es6", "dom", "es7", "esnext"],
                    experimentalDecorators: true,
                    moduleResolution: 'node'
                }),
                rollupResolve({
                    jsnext: true,
                    extensions: [ '.ts', '.js', '.json' ]
                }),
                commonjs()
            ]
        }).then(res => {
            res.generate({
                format: opts.format,
                name: opts.name,
                sourcemap: true
            }).then(code => {
                opts.file.contents = new Buffer(this.injectStyle({code: code.code}));
                opts.file.path = opts.file.path.replace(/\.ts/, `.${opts.type}.js`)
                
                resolve(opts.file)
            });
        }).catch(err => {
            console.log(chalk`{red ${err}}`)
            resolve(null)
        })
    })
}