// Import dependencies.
const { app } = require( 'electron' );
const Manager = require('../base/Manager.js');

// Check if app is running in a dev environment.
module.exports = class QuitHandler extends Manager {
    static init() {
        return _ => app.emit('window-all-closed');
    }
};
