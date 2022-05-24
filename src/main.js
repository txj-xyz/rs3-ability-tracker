// Import dependencies.
const { BrowserWindow } = require('electron');

module.exports = _ => {

    // Make main window globally reachable and set properties.
    windows.settings = new BrowserWindow({ ...windows.properties, ...{ width: 700, height: 200 } });

    // Load index file.
    windows.settings.loadFile(pages('index'));

    // If no keybinds have been set, show settings window, otherwise show main window.
    keybinds() // NOTE: Remove once settings UI is finished.
    // if (!keycache.length) keybinds();
    // else windows.settings.on('ready-to-show', windows.settings.show);
}
