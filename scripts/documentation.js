const glob = require('glob');
const path = require('path');
const fs = require('fs-extra');
const log = require('./utils').log;
const handlebars = require('handlebars');
const cwd = process.cwd();
const rootPath = path.resolve(process.mainModule.filename, '..', '..');

exports.createIndex = async function createIndex() {
    const promise = new Promise((resolve, reject) => {
        let map = {
            pages: []
        };
        glob(`${cwd}/dist/**/*.html`, (err, matches) => {
            if (matches.length) {
                map.pages = matches.map(match => {
                    let referenceFile = JSON.parse(fs.readFileSync(match.replace(/.html/, '.json'), 'utf8'))
                    delete referenceFile.body;
                    
                    const pathsObj =  {
                        pathJSON: match.split('dist')[1].replace(/.html/, '.json'),
                        pathHTML: match.split('dist')[1],
                    }

                    return Object.assign(pathsObj, referenceFile)
                })

            
                fs.outputJSON(`${cwd}/dist/index.json`, map, err => {
                    if (err) {
                        log(`ERROR: ${err}`, 4, 'Documentation')
                        return;
                    }

                    log('documentation index.json created', 1, 'Documentation')
                    resolve()
                })
            }
        })
    })

    await promise;
}

exports.createOverview = async function() {
    const promise = new Promise((resolve, reject) => {
        const templatePath = path.resolve(rootPath, 'templates', 'overview.hbs')
        fs.copyFile(templatePath, `${path.join(cwd, 'dist', 'demo.html')}`, (err) => {
            if (err) throw err;
            resolve();
        })
    })

    await promise;
}