// Import dependencies.
const [{ app }, { uIOhook }] = ['electron', 'uiohook-napi'].map(require);
const Manager = require('../base/Manager.js');

// Check if app is running in a dev environment.
module.exports = class QuitHandler extends Manager {
    static init() {
        return _ => {
            uIOhook.stop();
            windows.tray?.destroy();
            app.emit('quit');
        }
    }
};
