const through = require('through2')
const sass = require('node-sass')
const postcss = require('postcss')
const autoprefixer = require('autoprefixer')
const postcssOptions = [ autoprefixer({ browsers: ['last 2 versions'] }) ]
const path = require('path')
const fs = require('fs-extra')
const applyStylePath = require('./utils').applyStylePath
const StylesMap = require('./services/styles-map.service');
const stylesMap = new StylesMap();

module.exports = function(options) {
    const opts = Object.assign({
        sourceMap: true,
        outputStyle: 'expanded',
        postcssOptions: postcssOptions,
        cwd: process.cwd(),
        includePath: process.cwd()
    }, options)

    return through.obj(function(file, encoding, callback) {
        file.contents = new Buffer(file.contents.toString().replace(/@style\('([^]*?)'\)/g, (match, filepath) => {
            try {
                const fullFilepath = path.resolve(`${opts.cwd}/${filepath}`)
                const style = fs.readFileSync(fullFilepath, {encoding: 'utf8'})

                const compiledStyle = sass.renderSync({
                    data: style,
                    outputStyle: opts.outputStyle,
                    file: filepath,
                    includePaths: [ path.resolve(opts.includePath) ],
                    sourceMap: opts.sourceMap,
                    sourceMapEmbed: opts.sourceMap,
                    sourceMapContents: opts.sourceMap,
                    outFile: filepath
                })

                const code = {
                    css: postcss(postcssOptions).process(compiledStyle.css.toString()).css
                }

                stylesMap.applyStylePath(file, fullFilepath)

                return code.css

            } catch(err) {
                console.log(err)
                return
            }
        }))

        callback(null, file);
      });
}