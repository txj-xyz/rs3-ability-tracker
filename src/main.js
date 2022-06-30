// Import dependencies.
const {
    BrowserWindow,
    ipcMain,
    app,
    Tray,
    Menu: { buildFromTemplate },
} = require('electron');

module.exports = _ => {
    // If the main window already exists, show it instead of creating a new one.
    if (windows.main) {
        windows.main.show();
        return windows.main.focus();
    }

    // Make main window globally reachable and set properties.
    windows.main = new BrowserWindow({ ...windows.properties, ...{ width: 700, height: 190 } });

    // Load index file.
    windows.main.loadFile(pages('index'));

    // Set Alt-Menu Null
    windows.main.removeMenu();

    // Load tray icon.
    windows.tray = new Tray(`${__dirname}/icons/icon.png`);
    windows.tray.setToolTip('Ability Tracker');
    windows.tray.on('click', _ => {
        if (!windows.main.isVisible()) {
            windows.main.show();
            windows.main.focus();
            menu();
        }
    });

    // Window close event.
    windows.main.on('close', quitHander);

    // If no keybinds have been set, show main window, otherwise show main window.
    if (!config.referenceStorage.keybinds.length) keybinds();
    else
        windows.main.on('ready-to-show', _ => {
            windows.main.show();
            windows.main.focus();
            menu();
        });

    // Backend to frontend communication.
    ipcMain.on('open', (event, param) => {
        switch (param) {
            // Quit application.
            case 'quit': {
                app.emit('window-all-closed');
                break;
            }

            // Close ability window.
            case 'closeAbility': {
                windows.ability?.close();
                break;
            }

            // Open window.
            default: {
                !windows[param] && global[param] ? global[param]() : void 0;

                // Hide main window.
                if (param === 'ability' && config.minimizeToTray) {
                    windows.main.hide();
                    menu();
                }
                break;
            }
        }
        event.returnValue = null;
    });

    // Backend to frontend communication to update config data.
    ipcMain.on('updateConfig', (event, param) => {
        switch (param) {
            // Update 'trackCooldowns' value.
            case 'cooldown': {
                config.trackCooldowns = !config.trackCooldowns;
                if (!config.trackCooldowns) unregisterCooldowns();
                break;
            }

            // Update 'minimizeToTray' value.
            case 'tray': {
                config.minimizeToTray = !config.minimizeToTray;
                break;
            }

            // Update 'toggleSwitching' value.
            case 'bars': {
                config.toggleSwitching = !config.toggleSwitching;
                break;
            }

            // Update 'toggleSwitching' value.
            case 'lock': {
                config.lockTrackerWindow = !config.lockTrackerWindow;
                windows.ability?.setMovable(!config.lockTrackerWindow);
                windows.ability?.setResizable(!config.lockTrackerWindow);
                break;
            }

            // Other possible updates.
            default: {
                // Update 'barsSelection' value.
                if (typeof param === 'string' && isNaN(parseInt(param))) {
                    config.barsSelection = param.slice(5);
                }

                // Update 'numberOfIcons' value.
                else if (!isNaN(parseInt(param))) {
                    config.numberOfIcons = parseInt(param);

                    // Update ability window width using height and number of icons.

                    // If the ability window is open, update it.
                    if (windows.ability) {
                        windows.ability.webContents.send('refresh', config.numberOfIcons);
                        config.abilityWindow.width = config.abilityWindow.height * config.numberOfIcons;
                        windows.ability.setSize(config.abilityWindow.width, config.abilityWindow.height);
                        windows.ability.setAspectRatio((config.abilityWindow.height * config.numberOfIcons) / config.abilityWindow.height);
                    }

                    // Otherwise return config data.
                } else event.returnValue = config;
                break;
            }
        }

        update();
        if (!event.returnValue) event.returnValue = null;
    });

    // Tray menu update and events controller.
    function menu() {
        windows.tray.setContextMenu(
            buildFromTemplate([
                // Hide/Show main window.
                {
                    label: windows.main.isVisible() ? 'Hide Menu' : 'Show Menu',
                    click: _ => {
                        windows.main.isVisible() ? windows.main.hide() : windows.main.show();
                        menu();
                    },
                },

                // Stop/Start Tracking.
                {
                    label: windows.ability ? 'Stop Tracker' : 'Start Tracker',
                    click: _ => {
                        if (windows.ability) {
                            windows.ability.close();
                            if (!windows.main.isVisible()) windows.main.show();
                        } else {
                            ability();
                            if (windows.main.isVisible() && config.minimizeToTray) windows.main.hide();
                        }
                        menu();
                    },
                },

                // Open keybinds window.
                { label: 'Configure Keybinds', click: keybinds },

                // Open bars window.
                { label: 'Configure Bars', click: bars },

                // Quit application.
                { label: 'Quit', click: _ => app.emit('window-all-closed') },
            ])
        );
    }
};
