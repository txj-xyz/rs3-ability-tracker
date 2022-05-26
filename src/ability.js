// Import dependencies.
const { BrowserWindow, ipcMain } = require('electron');

module.exports = _ => {

    // Make keybinds window globally reachable and set properties.
    windows.ability = new BrowserWindow({
        ...windows.properties, ...{
            width: 80 * config.numberOfIcons + 10,
            height: 90,
            fullscreenable: false,
            titleBarStyle: 'hidden',
            frame: false,
            transparent: true,
            hasShadow: false,
            resizable: true,
            alwaysOnTop: true,
            show: true
        }
    });

    if (process.platform === 'darwin') windows.ability.setWindowButtonVisibility(false);

    windows.ability.on('close', _ => {
        windows.main.webContents.send('closeAbility');
        delete windows.ability;
    });

    windows.ability.setAspectRatio((80 * config.numberOfIcons + 10) / 90);
    windows.ability.setAlwaysOnTop(true, "screen-saver");
    windows.ability.setVisibleOnAllWorkspaces(true);

    // Load keybinds file.
    windows.ability.loadFile(pages('ability'));
}