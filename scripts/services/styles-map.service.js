const fs = require('fs-extra')

let instance;

class StylesMap {
    constructor() {
        this.map = {};
        
        if (!instance) {
            instance = this;
        }

        return instance;
    }

    /**
     * Apply paths to styles map
     * A function to save a map of ts files and style files to be used for 
     * triggering recompile of tsFiles on style changes.
     * 
     * @param {vinylStreamFile} file - A vinyl stream file.
    */
    applyToStylesMap(file) {
        if (file.styles && file.originalPath) {
            file.styles.forEach(path => {
                if (!this.map[path]) {
                    this.map[path] = [file.originalPath];
                } else if (!this.map[path].includes(file.originalPath)) {
                    this.map[path].push(file.originalPath);
                }
            })
        }
    }

    /**
     * Apply styles path to vinyl stream file
     * 
     * @param {vinylStreamFile} file - A vinyl stream file.
     * @param {string} path - path to original scss/css file.
     */
    applyStylePath(file, path) {
        if (!file.styles) {
            file.styles = [];
        }

        file.styles.push(path)
    }

    /**
     * Update timestamp from styles map path
     * 
     * @param {vinylStreamFile} file - A viny stream file.
     */
    updateTimestampFromStylesMap(file) {
        if (this.map[file.path]) {
            const timestamp = + new Date() / 1000 | 0;
            this.map[file.path].forEach(tsPath => {
                fs.utimesSync(tsPath, timestamp, timestamp);
            })
        }
    }
}

module.exports = StylesMap;