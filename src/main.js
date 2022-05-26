// Import dependencies.
const { BrowserWindow, ipcMain, app, Tray, Menu: { buildFromTemplate }, nativeImage: { createFromPath } } = require('electron');
const { writeFileSync } = require('fs');

module.exports = _ => {

    // Make main window globally reachable and set properties.
    windows.main = new BrowserWindow({ ...windows.properties, ...{ width: 700, height: 200 } });

    // Load index file.
    windows.main.loadFile(pages('index'));
    windows.tray = new Tray(`${__dirname}/icons/icon.png`);
    windows.tray.setToolTip('Ability Tracker')
    windows.tray.on('click', _ => {
        if (!windows.main.isVisible()) {
            windows.main.show()
            windows.main.focus()
            menu()
        }
    })

    windows.main.on('close', _ => app.emit('window-all-closed'))

    // If no keybinds have been set, show main window, otherwise show main window.
    if (!keycache.length) keybinds();
    else windows.main.on('ready-to-show', _ => {
        windows.main.show()
        windows.main.focus()
        menu()
    });

    // Backend to frontend communication.
    ipcMain.on('open', (event, param) => {
        switch (param) {
            case 'quit': {
                app.emit('window-all-closed');
                break;
            }
            case 'closeAbility': {
                windows.ability?.close();
                break;
            }
            default: {
                !windows[param] && global[param] ? global[param]() : void 0;
                if (param === 'ability') {
                    windows.main.hide()
                    menu()
                }
                break;
            }
        }
        event.returnValue = null;
    })

    ipcMain.on('updateConfig', (event, param) => {
        switch (param) {
            case 'cooldown': {
                config.trackCooldowns = !config.trackCooldowns;
                writeFileSync('./cfg/config.json', JSON.stringify(config, null, 4));
                event.returnValue = null;
                break;
            }
            case 'top': {
                config.alwaysOnTop = !config.alwaysOnTop;
                writeFileSync('./cfg/config.json', JSON.stringify(config, null, 4));
                event.returnValue = null;
                break;
            }
            default: {
                if (!isNaN(parseInt(param))) {
                    config.numberOfIcons = parseInt(param);
                    if (windows.ability) {
                        windows.ability.setSize(80 * config.numberOfIcons + 10, 80 + 10);
                        windows.ability.webContents.send('refresh', config.numberOfIcons);
                    }
                    writeFileSync('./cfg/config.json', JSON.stringify(config, null, 4));
                    event.returnValue = null;
                } else event.returnValue = config;
                break;
            }
        }
    })

    function menu() {
        windows.tray.setContextMenu(buildFromTemplate([
            {
                label: windows.main.isVisible() ? 'Hide Menu' : 'Show Menu',
                click: _ => {
                    windows.main.isVisible() ? windows.main.hide() : windows.main.show()
                    menu()
                }
            },
            {
                label: windows.ability ? 'Stop Tracker' : 'Start Tracker',
                click: _ => {
                    if (windows.ability) {
                        windows.ability.close()
                        if (!windows.main.isVisible()) windows.main.show()
                    } else {
                        ability();
                        if (windows.main.isVisible()) windows.main.hide()
                    }
                    menu()
                }
            },
            { label: 'Configure Keybinds', click: keybinds },
            { label: 'Quit', click: _ => app.emit('window-all-closed') }
        ]))
    }
}
