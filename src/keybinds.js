// Import dependencies.
const { BrowserWindow, ipcMain } = require('electron');

module.exports = _ => {

    // If the keybinds window already exists, show it instead of creating a new one.
    if (windows.keybinds) {
        windows.keybinds.show();
        return windows.keybinds.focus();
    }

    // Make keybinds window globally reachable and set properties.
    windows.keybinds = new BrowserWindow({ ...windows.properties, ...{ width: 460, height: 350 } });

    // Load keybinds file.
    windows.keybinds.loadFile(pages('keybinds'));

    // Show keybinds window when it's ready.
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
                write.keys();

                // Reinitialize the keybind listener.
                triggers();
                event.returnValue = null;
                break;
            }
        }
    })
}
