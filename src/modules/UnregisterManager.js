// Import dependencies.
const [Manager, { resolve }] = ['../base/Manager.js', 'path'].map(require);

// Function to get frontend page paths.
module.exports = class Unregister extends Manager {
    static init() {
        return null
    }
};
