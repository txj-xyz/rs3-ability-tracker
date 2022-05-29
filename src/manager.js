// Check if given file exists.
const { existsSync, writeFileSync } = require('fs');

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

    const raw = {
        keybinds: [],
        config: {
            alwaysOnTop: true,
            trackCooldowns: true,
            minimizeToTray: true,
            numberOfIcons: 10,
            barsSelection: '',
            abilityWindow: {
                x: null,
                y: null,
                width: 810,
                height: 90
            }
        }
    }

    // In any other case, load default data.
    const defaults = raw[path.slice(path.lastIndexOf('/') + 1).replace(/\.json/g, '')] || void 0;
    if (defaults) writeFileSync(path.slice(1), JSON.stringify(defaults));
    return defaults;
}

// Merge two objects.
Object.mergify = (obj1, obj2) => Object.keys(obj2).map(key => obj1[key] = obj2[key]);

module.exports = {
    // Page path creator.
    pages: name => `./ability-window/html/${name}.html`,

    // Ability list.
    abilities: file('../cfg/abilities.json'),

    // Keybinds list.
    keycache: file('../cfg/keybinds.json'),

    // Config.
    config: file('../cfg/config.json'),

    // Main window file.
    main: require('./main.js'),

    // Keybinds window file.
    keybinds: require('./keybinds.js'),

    // Ability window file.
    ability: require('./ability.js'),

    // File writer.
    write: {
        keys: _ => writeFileSync('./cfg/keybinds.json', JSON.stringify(keycache)),
        config: _ => writeFileSync('./cfg/config.json', JSON.stringify(config)),
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
