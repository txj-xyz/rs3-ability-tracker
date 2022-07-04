// Import dependencies.
const [Manager, { uIOhook }] = ['../base/Manager.js', 'uiohook-napi'].map(require);

// Function to get frontend page paths.
module.exports = class Unregister extends Manager {
    static init() {
        return _ => {
            uIOhook.removeAllListeners('keydown');
            uIOhook.removeAllListeners('keyup');
        }
    }
};
