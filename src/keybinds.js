// Import dependencies.
const { BrowserWindow, ipcMain } = require('electron');
const { writeFileSync } = require('fs');

module.exports = _ => {

    if (windows.keybinds) {
        windows.keybinds.show();
        windows.keybinds.focus();
        return
    }

    // Make keybinds window globally reachable and set properties.
    windows.keybinds = new BrowserWindow({ ...windows.properties, ...{ width: 460, height: 350 } });
    
    // Load keybinds file.
    windows.keybinds.loadFile(pages('keybinds'));

    windows.keybinds.on('ready-to-show', windows.keybinds.show);

    // If the keybinds file is closed and the main window is hidden, show the main window.
    windows.keybinds.on('close', _ => {
        !windows.main.isVisible() ? windows.main.show() : void 0;
        delete windows.keybinds;
    });

    // Backend to frontend communication.
    ipcMain.on('keybinds', (event, param) => {
        switch (param.query) {

            // Get the keybinds.
            case 'keycache': {
                event.returnValue = keycache;
                break;
            }

            // Get the ability list.
            case 'abilities': {
                event.returnValue = abilities;
                break;
            }

            // Set/Update the keybinds.
            case 'binds': {
                const keybinds = [];
                param.binds.map(k => {
                    const ability = keybinds.find(e => e.ability === k.ability);
                    if (ability) ability.key.push(k.key);
                    else keybinds.push({ ability: k.ability, key: [k.key] });
                })
                keycache = keybinds;

                // Save to cache.
                writeFileSync('./cfg/keybinds.json', JSON.stringify(keybinds, null, 4));
                event.returnValue = null;
                break;
            }
        }
    })
}
