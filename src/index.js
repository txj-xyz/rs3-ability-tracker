// Import dependencies.
const { BrowserWindow, app } = require('electron');
const { resolve } = require('path');
const manager = require(resolve(__dirname, 'manager.js'));
const { uIOhook } = require('uiohook-napi');

// If the app is being started from `windows.squirrel` installer then stop and return
if (require('electron-squirrel-startup')) {
    app.quit()
    process.exit(1)
};

// Make globally usable variables.
for (const property in manager) global[property] = manager[property];

app
    // App ready event.
    .on('ready', main)

    // App start event (Run if app is not ready).
    .on('activate', _ => !BrowserWindow.getAllWindows().length ? app.emit('ready') : void 0)

    // App quit event.
    .on('window-all-closed', _ => {
        uIOhook.stop()
        app.isQuiting = true
        app.quit()
    });
