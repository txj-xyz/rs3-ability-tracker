// Import dependencies.
const Manager = require('../base/Manager.js');

// Check if app is running in a dev environment.
module.exports = class DevMode extends Manager {
    static init() {
        return process.argv[2] === 'dev';
    }
};
