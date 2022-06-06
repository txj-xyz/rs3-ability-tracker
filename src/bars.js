// Import dependencies.
const { BrowserWindow, ipcMain } = require('electron');

module.exports = _ => {

    // If the bars window already exists, show it instead of creating a new one.
    if (windows.bars) {
        windows.bars.show();
        return windows.bars.focus();
    }

    // Make bars window globally reachable and set properties.
    windows.bars = new BrowserWindow({ ...windows.properties, ...{ width: 460, height: 350 } });

    // Load bars file.
    windows.bars.loadFile(pages('bars'));

    // Show bars window when it's ready.
    windows.bars.on('ready-to-show', windows.bars.show);

    // Window close event.
    windows.bars.on('close', _ => {
        !windows.main.isVisible() ? windows.main.show() : void 0;
        delete windows.bars;
    });

    // Pass data from bars window to keybinds window and main window.
    ipcMain.on('passToKeys', (event, arg) => {
        windows.keybinds?.webContents.send('passToKeys', arg);
        windows.main?.webContents.send('passToKeys', arg);
        event.returnValue = null;
    })

     // Frontend to backend communication.
    ipcMain.on('config', (event, param) => {
        // Send config if no param is passed.
        if (!param) event.returnValue = config;

        // Update keybinds.
        else if (typeof param === 'string') {
            windows.keybinds?.webContents.send('updateKeys', param)

            // Remove keybinds.
            config.referenceStorage.keybinds = config.referenceStorage.keybinds.filter(e => e.bar.toLowerCase() !== param.toLowerCase());
            update();
            event.returnValue = null
        }
        else {
            
            // Update and send bar list to main and keybinds windows.
            config.referenceStorage.bars = param;
            windows.keybinds?.webContents.send('passToKeys', config.referenceStorage.bars)
            windows.main?.webContents.send('passToKeys', config.referenceStorage.bars)
            update();
            event.returnValue = null
        }
    })
}
