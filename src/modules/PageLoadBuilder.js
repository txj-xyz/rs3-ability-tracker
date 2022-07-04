// Import dependencies.
const [Manager, { resolve }] = ['../base/Manager.js', 'path'].map(require);

// Function to get frontend page paths.
module.exports = class Page extends Manager {
    static init() {
        return name => resolve(__dirname, `../../ability-window/html/${name}.html`);
    }
};
