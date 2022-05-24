// Import dependencies.
const { BrowserWindow, app } = require('electron');
const { abilities, keycache, windows, pages, settings, keybinds } = require('#manager');

// Make globally usable variables.
Object.mergify(global, { abilities, keycache, windows, pages, settings, keybinds });

app
    // App ready event.
    .on('ready', settings)

    // App start event (Run if app is not ready).
    .on('activate', _ => !BrowserWindow.getAllWindows().length ? app.emit('ready') : void 0)

    // App quit event.
    .on('window-all-closed', _ => {
        app.isQuiting = true
        app.quit()
    });
