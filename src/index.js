// Import dependencies.
const [{ BrowserWindow, app }, { resolve }, { uIOhook }] = ['electron', 'path', 'uiohook-napi'].map(require);

// Make globally usable variables.
for (const property in (manager = require(resolve(__dirname, './base/Manager.js')).load())) global[property] = manager[property];

app
    // App ready event.
    .on('ready', _ => new Main())

    // App second instance event.
    .on('second-instance', _ => new Main())

    // App start event (Run if app is not ready).
    .on('activate', _ => (!BrowserWindow.getAllWindows().length ? app.emit('ready') : void 0))

    // App quit event.
    .on('window-all-closed', _ => {
        uIOhook.stop();
        app.isQuiting = true;
        app.quit();
        process.exit(1);
    })

    // Disable app hardware acceleration.
    .disableHardwareAcceleration();

// Do not allow second instances and do not allow the app to be started from 'windows.squirrel'.
!app.requestSingleInstanceLock() || require('electron-squirrel-startup') ? app.emit('window-all-closed') : void 0;
