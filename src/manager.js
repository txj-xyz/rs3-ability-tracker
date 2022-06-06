// Check if given file exists.
const { existsSync, writeFileSync } = require('fs');
const { uIOhook, UiohookKey } = require('uiohook-napi');

// File import logic.
const file = (path, data, failed = false) => {

    // Check if file exists.
    if (existsSync(path.slice(1))) {

        // Check if file data is corrupted.
        try {
            data = require(path);
        } catch (e) {
            failed = true;
        }

        // If not corrupted, return data.
        if (!failed) return data;
    }

    // Default config data.
    const config = {
        alwaysOnTop: true,
        trackCooldowns: true,
        minimizeToTray: true,
        toggleSwitching: false,
        numberOfIcons: 10,
        barsSelection: 'Global',
        abilityWindow: {
            x: null,
            y: null,
            width: 810,
            height: 90
        },
        referenceStorage: {
            keybinds: [],
            bars: []
        }
    }

    // In any other case, load default data.
    writeFileSync(path.slice(1), JSON.stringify(config));
    return config;
}

// Start keybinds listener.
uIOhook.start();

module.exports = {
    // Page path creator.
    pages: name => `./ability-window/html/${name}.html`,

    // Ability list.
    abilities: require('../cfg/abilities.json'),

    // Config.
    config: file('../cfg/config.json'),

    // Main window file.
    main: require('./main.js'),

    // Keybinds window file.
    keybinds: require('./keybinds.js'),

    // Bars window file.
    bars: require('./bars.js'),

    // Ability window file.
    ability: require('./ability.js'),

    // File writer.
    update: _ => writeFileSync('./cfg/config.json', JSON.stringify(config)),

    // Keybinds listener code.
    triggers: _ => {

        // Remove all listeners.
        uIOhook.removeAllListeners('keydown');

        // Add new listeners.
        uIOhook.on('keydown', trigger => {

            // For every keyset.
            for (const set of config.referenceStorage.keybinds) {

                // For every keybind.
                for (const key of set.key) {

                    // Get modifier keys.
                    const modifiers = key.split('+').map(e => e.trim());

                    // Get letter.
                    const letter = modifiers.pop();
                    let failed = false;

                    // Check if keybind is pressed.
                    if ((modifiers.includes('Shift') && !trigger.shiftKey) || (!modifiers.includes('Shift') && trigger.shiftKey)) failed = true;
                    if (((modifiers.includes('Control') || modifiers.includes('Ctrl')) && !trigger.ctrlKey) || ((!modifiers.includes('Control') && !modifiers.includes('Ctrl')) && trigger.ctrlKey)) failed = true;
                    if (((modifiers.includes('Alt') || modifiers.includes('AltGr')) && !trigger.altKey) || ((!modifiers.includes('Alt') && !modifiers.includes('AltGr')) && trigger.altKey)) failed = true;
                    if (((modifiers.includes('Command') || modifiers.includes('Super')) && !trigger.metaKey) || ((!modifiers.includes('Command') && !modifiers.includes('Super')) && trigger.metaKey)) failed = true;
                    UiohookKey[letter] === trigger.keycode && !failed ? windows.ability?.webContents.send('trigger', set) : void 0;
                }
            }
        });
    },

    // Window properties + window storage.
    windows: {
        properties: {
            icon: `${__dirname}/icons/icon.png`,
            autoHideMenuBar: true,
            resizable: false,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        }
    }
};
