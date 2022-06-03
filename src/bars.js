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

    ipcMain.on('keybinds', (event, param) => {
        switch (param.query) {

            // Get the keybinds.
            case 'keycache': {
                event.returnValue = config.referenceStorage.keybinds;
                break;
            }
        }
    })
}
