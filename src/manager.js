// Check if given file exists.
const { existsSync, writeFileSync } = require('fs');
const { uIOhook, UiohookKey } = require('uiohook-napi');
const path = require('path');
const { app } = require('electron');
const activeWindows = require('electron-active-window');

let gCD = {
    previousSuccess: Date.now(),
    keyArray: null
};

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

// Start keybinds listener.
uIOhook.start();

module.exports = {

    // Check for dev mode
    devMode: process.argv[2] === "dev",

    // Page path creator.
    pages: name => path.resolve(__dirname, `../ability-window/html/${name}.html`),

    // Ability list.
    abilities: require(path.resolve(__dirname, '../cfg/abilities.json')).abilities,

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
        // check to make sure a key is not held down
        const keyCheck = [];
        // Remove all listeners.
        uIOhook.removeAllListeners('keydown');

        function getKeyName(name, val) {
            return (val ? name : "");
        }

        function hashEvent(ev) {
            return getKeyName("a", ev.altKey) +
            getKeyName("c", ev.ctrlKey) +
            getKeyName("m", ev.metaKey) +
            getKeyName("s", ev.shiftKey) +
            ev.keycode;
        }

        function handleKeyPress(trigger) {
            if(!windows.ability) return;
            console.log('vefore', gCD)
            // hi please help me <3 i love you <3
            if(gCD.keyArray && (Date.now() - gCD.previousSuccess) < (abilities[gCD.keyArray.ability]?.cooldown || 1) * 600) return;

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

                            const modifierKeyMap = {
                                "Shift": "shiftKey",
                                "Control": "ctrlKey",
                                "Ctrl": "ctrlKey",
                                "Alt": "altKey",
                                "AltGr": "altKey",
                                "Command": "metaKey",
                                "Super": "metaKey",
                                "Windows": "metaKey",
                                "Win": "metaKey",
                            };

                            for (const key of Object.keys(modifierKeyMap)) {
                                if (modifiers.includes(key) && !trigger[modifierKeyMap[key]]) failed = true;
                                if (!modifiers.includes(key) && trigger[modifierKeyMap[key]]) failed = true;
                            }
                            
                            if((UiohookKey[letter] === trigger.keycode || symbolKeycodeList[letter] === trigger.keycode) && !failed){
                                windows.ability?.webContents.send('trigger', set);
                                // set timestamp for successfull keybind press
                                gCD.previousSuccess = config.trackCooldowns ? Date.now() : 0;
                                gCD.keyArray = set;
                                console.log(gCD)
                            }

                        }
                    }
                }
            });
        }

        uIOhook.on('keydown', event => {
            const hash = hashEvent(event);
            if (!keyCheck[event.keycode]) {
                keyCheck[event.keycode] = new Map();
            }
            if (!keyCheck[event.keycode].get(hash)) {
                handleKeyPress(event);
            }
            keyCheck[event.keycode].set(hash, true);
        });

        uIOhook.on('keyup', event => {
            if (!keyCheck[event.keycode]) return;
            keyCheck[event.keycode].clear();
        });
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
