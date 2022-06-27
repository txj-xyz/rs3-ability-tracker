// Import dependencies.
const Manager = require('../base/Manager.js');

// Check if app is running in a dev environment.
module.exports = class _Platform extends Manager {
    static init() {
        return process.platform;
    }
};
