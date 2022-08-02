// Import dependencies.
const Manager = require('../base/Manager.js');
const [{ readdirSync, existsSync, writeFileSync, mkdirSync, unlinkSync }, { resolve }] = ['fs', 'path'].map(require);

// Check if app is running in a dev environment.
module.exports = class _Folder extends Manager {
    static init() {
        return path => this.checkCustomFolder(path);
    }

    static checkCustomFolder(path) {
        if(typeof path !== 'string') return new TypeError('path must be a string')
        const customPath = resolve(super.__userData, path);
        if (!existsSync(customPath)) {
            mkdirSync(customPath);
        }
        return customPath;
    }
};
