// Import dependencies.
const { BrowserWindow, ipcMain } = require('electron');

module.exports = _ => {

    // If the keybinds window already exists, show it instead of creating a new one.
    if (windows.bars) {
        windows.bars.show();
        return windows.bars.focus();
    }

    // Make keybinds window globally reachable and set properties.
    windows.bars = new BrowserWindow({ ...windows.properties, ...{ width: 460, height: 350 } });

    // Load keybinds file.
    windows.bars.loadFile(pages('bars'));

    // Show keybinds window when it's ready.
    windows.bars.on('ready-to-show', windows.bars.show);

    windows.bars.on('close', _ => {
        !windows.main.isVisible() ? windows.main.show() : void 0;
        delete windows.bars;
    });

    ipcMain.on('passToKeys', (event, arg) => {
        windows.keybinds?.webContents.send('passToKeys', arg);
        windows.main?.webContents.send('passToKeys', arg);
        event.returnValue = null;
    })

    ipcMain.on('config', (event, param) => {
        if (!param) event.returnValue = config;
        else if (typeof param === 'string') {
            console.log(param)
            windows.keybinds?.webContents.send('updateKeys', param)
            config.referenceStorage.keybinds = config.referenceStorage.keybinds.filter(e => e.bar.toLowerCase() !== param.toLowerCase());
            update();
            event.returnValue = null
        }
        else {
            // windows.keybinds?.webContents.send('config', param);
            config.referenceStorage.bars = param;
            windows.keybinds?.webContents.send('passToKeys', config.referenceStorage.bars)
            windows.main?.webContents.send('passToKeys', config.referenceStorage.bars)
            update();
            event.returnValue = null
        }
    })
}
