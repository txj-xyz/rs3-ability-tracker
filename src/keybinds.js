// Import dependencies.
const { BrowserWindow, ipcMain } = require('electron');

module.exports = _ => {
    // If the keybinds window already exists, show it instead of creating a new one.
    if (windows.keybinds) {
        windows.keybinds.show();
        return windows.keybinds.focus();
    }

    // Make keybinds window globally reachable and set properties.
    windows.keybinds = new BrowserWindow({ ...windows.properties, ...{ width: 635, height: 350 } });

    // Load keybinds file.
    windows.keybinds.loadFile(pages('keybinds'));

    // Show keybinds window when it's ready.
    windows.keybinds.on('ready-to-show', windows.keybinds.show);

    // If the keybinds file is closed and the main window is hidden, show the main window.
    windows.keybinds.on('close', _ => {
        !windows.main.isVisible() ? windows.main.show() : void 0;
        delete windows.keybinds;
    });

    // Pass data from keybinds window to bars window.
    ipcMain.on('passToBars', (event, arg) => {
        windows.bars?.webContents.send('passToBars', arg);
        event.returnValue = null;
    });

    // Backend to frontend communication.
    ipcMain.on('keybinds', (event, param) => {
        switch (param.query) {
            // Get the keybinds.
            case 'keycache': {
                event.returnValue = config.referenceStorage.keybinds;
                break;
            }

            // Get the ability list.
            case 'abilities': {
                event.returnValue = abilities.map(e => e.name.replace(/( |_)/g, ' '));
                break;
            }

            // Get the bars list.
            case 'bars': {
                event.returnValue = config.referenceStorage.bars;
                break;
            }

            case 'keycodes': {
                event.returnValue = keycodes;
                break;
            }

            // Set/Update the keybinds.
            case 'binds': {
                const keybinds = [];
                param.binds.map(k => {
                    const ability = keybinds.find(e => e.name === k.name);
                    if (ability) ability.key.push(k.key);
                    else keybinds.push({ name: k.name, type: 'Weapon', key: [k.key], bar: k.bar });
                });
                config.referenceStorage.keybinds = keybinds;

                // Send new data to bars window.
                windows.bars?.webContents.send(
                    'passToBars',
                    config.referenceStorage.keybinds.map(e => e.bar)
                );

                // Save to cache.
                update();

                event.returnValue = null;
                break;
            }
        }
    });
};
