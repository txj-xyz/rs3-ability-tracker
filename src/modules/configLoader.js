// Import dependencies.
const [Manager, { resolve }] = ['../base/Manager.js', 'path'].map(require);

// Check if app is running in a dev environment.
module.exports = class Config extends Manager {
    static init() {
        return super.file(resolve(__dirname, `../cfg/game-key-data.json`))
    }
};
