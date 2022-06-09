// Check if given file exists.
const { existsSync, writeFileSync } = require('fs');
const { uIOhook, UiohookKey } = require('uiohook-napi');
const path = require('path');
const { app } = require('electron');
const activeWindows = require('electron-active-window');
const throttle = require('lodash.throttle');

const symbolKeycodeList = {
    // Numpad0: 82,
    // Numpad1: 79,
    // Numpad2: 80,
    // Numpad3: 81,
    // Numpad4: 75,
    // Numpad5: 76,
    // Numpad6: 77,
    // Numpad7: 71,
    // Numpad8: 72,
    // Numpad9: 73,
    // NumpadMultiply: 55,
    // NumpadAdd: 78,
    // NumpadSubtract: 74,
    // NumpadDecimal: 83,
    // NumpadDivide: 3637,
    ';': 39,
    '=': 13,
    ',': 51,
    '-': 12,
    '.': 52,
    '/': 53,
    '[': 26,
    '\\': 43,
    ']': 27,
    '"': 40,
}
// File import logic.
const file = (_path, data, failed = false) => {

    // Check if file exists.
    if (existsSync(_path)) {

        // Check if file data is corrupted.
        try {
            data = require(_path);
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
        minimizeToTray: false,
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
    writeFileSync(_path, JSON.stringify(config, null, 2));
    return config;
}

const cooldownHandler = (abilities) => {
    const cd = new Map();
    abilities.map(e => cd.set(e.name.replace(/( |_)/g, '_'), e.cooldown > 0 ? e.cooldown * 600 - 100 : e.cooldown))
    return cd;
}

// Start keybinds listener.
uIOhook.start();

module.exports = {

    // Check for dev mode
    devMode: process.argv[2] === "dev",

    // Page path creator.
    pages: name => path.resolve(__dirname, `../ability-window/html/${name}.html`),

    // Ability list.
    abilities: require(path.resolve(__dirname, '../cfg/abilities.json')).abilities.map(e => e.name.replace(/( |_)/g, ' ')),

    // Load Cooldowns
    cooldowns: cooldownHandler(require(path.resolve(__dirname, '../cfg/abilities.json')).abilities),

    // Config.
    config: file(path.resolve((process.argv[2] === "dev" ? '' : app.getPath('userData')), 'config.json')),

    // Main window file.
    main: require(path.resolve(__dirname, './main.js')),

    // Keybinds window file.
    keybinds: require(path.resolve(__dirname, './keybinds.js')),

    // Bars window file.
    bars: require(path.resolve(__dirname, './bars.js')),

    // Ability window file.
    ability: require(path.resolve(__dirname, './ability.js')),

    // File writer.
    update: _ => writeFileSync(path.resolve((process.argv[2] === "dev" ? '' : app.getPath('userData')), 'config.json'), JSON.stringify(config, null, 2)),

    // Keybinds listener code.
    triggers: _ => {
        // Remove all listeners.
        uIOhook.removeAllListeners('keydown');

        // Add new listeners.
        uIOhook.on('keydown', throttle(trigger => {
            activeWindows().getActiveWindow().then(activeWin => {
                if(activeWin.windowClass === "rs2client.exe" || process.argv[2] === "dev") {
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
                            (UiohookKey[letter] === trigger.keycode || symbolKeycodeList[letter] === trigger.keycode) && !failed ? windows.ability?.webContents.send('trigger', set) : void 0;
                        }
                    }
                }
            });
        }, 600));
    },

    // Window properties + window storage.
    windows: {
        properties: {
            icon: path.join(__dirname, './icons/icon.png'),
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
