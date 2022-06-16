// Check if given file exists.
const { existsSync, writeFileSync } = require('fs');
const { uIOhook, UiohookKey } = require('uiohook-napi');
const path = require('path');
const { app } = require('electron');
const activeWindows = require('electron-active-window');
let cooldownTracking = new Map();
let activeBar = null;

const rsOptions = {
    gcdActive: true,
    abilityTimingBuffer: 1000,
    tickTime: 600,
    duringGCDAbilities: ['Surge', 'Escape', 'Bladed Dive', 'Provoke'],
    doubleUseAbils: [
        { name: 'Surge', triggered: false },
        { name: 'Escape', triggered: false },
        { name: 'Bladed Dive', triggered: false },
        { name: 'Provoke', triggered: false },
    ],
};

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
        trackCooldowns: true,
        minimizeToTray: false,
        toggleSwitching: false,
        lockTrackerWindow: false,
        numberOfIcons: 10,
        barsSelection: 'Global',
        abilityWindow: {
            x: null,
            y: null,
            width: 810,
            height: 90,
        },
        referenceStorage: {
            keybinds: [],
            bars: [],
        },
    };

    // In any other case, load default data.
    writeFileSync(_path, JSON.stringify(config, null, 2));
    return config;
};

// Start keybinds listener.
uIOhook.start();

module.exports = {
    // Check for dev mode
    devMode: process.argv[2] === 'dev',

    // Page path creator.
    pages: name => path.resolve(__dirname, `../ability-window/html/${name}.html`),

    // Ability list.
    abilities: require(path.resolve(__dirname, '../cfg/game-key-data.json')),

    // Config.
    config: file(path.resolve(process.argv[2] === 'dev' ? '' : app.getPath('userData'), 'config.json')),

    // Main window file.
    main: require(path.resolve(__dirname, './main.js')),

    // Keybinds window file.
    keybinds: require(path.resolve(__dirname, './keybinds.js')),

    // Keycode list.
    keycodes: require(path.resolve(__dirname, '../cfg/keycodes.json')),

    // Bars window file.
    bars: require(path.resolve(__dirname, './bars.js')),

    // Ability window file.
    ability: require(path.resolve(__dirname, './ability.js')),

    // File writer.
    update: _ => writeFileSync(path.resolve(process.argv[2] === 'dev' ? '' : app.getPath('userData'), 'config.json'), JSON.stringify(config, null, 2)),

    unregisterHooks: _ => {
        uIOhook.removeAllListeners('keydown');
        uIOhook.removeAllListeners('keyup');
    },

    unregisterCooldowns: _ => cooldownTracking.clear(),

    // Keybinds listener code.
    triggers: _ => {
        // check to make sure a key is not held down
        const keyCheck = [];

        function getKeyName(name, val) {
            return val ? name : '';
        }

        function hashEvent(ev) {
            return getKeyName('a', ev.altKey) + getKeyName('c', ev.ctrlKey) + getKeyName('m', ev.metaKey) + getKeyName('s', ev.shiftKey) + ev.keycode;
        }

        function rs3Instance() {
            let found = false;
            if(devMode) return found = true;
            activeWindows().getActiveWindow().then(activeWin => {
                const _win = activeWin.windowName.match(/(rs2client|RuneScape)/g)?.[0] ?? null;
                _win ? found = true : found = false;
                return found;
            });
            
        }

        function handleKeyPress(trigger) {
            for (const set of config.referenceStorage.keybinds) {
                let cooldownRef = cooldownTracking.get(set.name);

                // if key is pressed inside of the cooldown window then do nothing, if the cooldown is 0 then wait 600 ms
                if (!cooldownRef || Date.now() - cooldownRef.time > cooldownRef.cooldown) {
                    // For every keybind.
                    for (const key of set.key) {
                        // Get modifier keys.
                        const modifiers = key.split('+').map(e => e.trim());

                        // Get letter.
                        const letter = modifiers.pop();
                        let failed = false;

                        const modifierKeyMap = {
                            Shift: 'shiftKey',
                            Ctrl: 'ctrlKey',
                            Alt: 'altKey',
                            Super: 'metaKey',
                        };

                        // check if modifiers are pressed
                        for (const key of Object.keys(modifierKeyMap)) {
                            if (modifiers.includes(key) && !trigger[modifierKeyMap[key]]) failed = true;
                            if (!modifiers.includes(key) && trigger[modifierKeyMap[key]]) failed = true;
                        }
                        // if normal key is pressed and is not a special case for during gcd ability return because GCD is active
                        if (!rsOptions.duringGCDAbilities.includes(set.name) && !rsOptions.gcdActive) return;

                        // Combat loop found keybind
                        if ((UiohookKey[letter] === trigger.keycode || keycodes[letter] === trigger.keycode) && !failed) {
                            // set timestamp for successfull keybind press
                            if (config.toggleSwitching && set.type === 'Weapon' && set.bar.toLowerCase() !== activeBar?.toLowerCase()) activeBar = set.bar;

                            // if (set.group === 'Prayer') ...

                            if (set.bar.toLowerCase() === (config.toggleSwitching ? activeBar : config.barsSelection)?.toLowerCase()) {
                                let icon = abilities?.filter(ability => ability.name === set.name.replace(/( |_)/g, ' '))[0]?.icon;

                                windows.ability?.webContents.send('trigger', { ...set, icon });

                                //prettier-ignore
                                let cooldown = (abilities?.filter(ability => ability.name === set.name.replace(/( |_)/g, ' '))[0]?.cooldown ?? 1) * rsOptions.tickTime - rsOptions.abilityTimingBuffer;

                                // special cases like surge / escape
                                let doubleUseAbils = rsOptions.doubleUseAbils.map(e => e.name) ?? null;
                                let checkCase = rsOptions.doubleUseAbils.find(e => e.name === set.name) ?? null;
                                if (doubleUseAbils.includes(set.name) && !checkCase.triggered) {
                                    cooldown = rsOptions.tickTime;
                                    checkCase.triggered = true;
                                } else if (doubleUseAbils.includes(set.name) && checkCase.triggered) {
                                    checkCase.triggered = false;
                                }

                                cooldownTracking.set(set.name, {
                                    ...set,
                                    time: config.trackCooldowns ? Date.now() : 0,
                                    cooldown,
                                });

                                // GCD Only Timing
                                if (!rsOptions.duringGCDAbilities.includes(set.name) && config.trackCooldowns) {
                                    rsOptions.gcdActive = false;
                                    setTimeout(() => {
                                        rsOptions.gcdActive = true;
                                    }, rsOptions.tickTime);
                                }
                            }
                        }
                    }
                }
            }
        }

        // Listen to keydown.
        uIOhook.on('keydown', event => {
            if(!rs3Instance()) return

            const hash = hashEvent(event);
            if (!keyCheck[event.keycode]) {
                keyCheck[event.keycode] = new Map();
            }
            if (!keyCheck[event.keycode].get(hash)) {
                handleKeyPress(event);
            }
            keyCheck[event.keycode].set(hash, true);
        });

        // Listen to keyup.
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
                contextIsolation: false,
            },
        },
    },
};
