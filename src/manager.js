// Check if given file exists.
const { existsSync, writeFileSync } = require('fs');
const file = (path, data, failed = false) => {
    if (existsSync(path.slice(1))) {
        try {
            data = require(path)
        } catch (e) {
            failed = true;
        }

        if (!failed) return data;
    }

    const defaultData = require(`${path.slice(0, path.lastIndexOf('/'))}/.default.${path.slice(path.lastIndexOf('/') + 1)}`);
    writeFileSync(path.slice(1), JSON.stringify(defaultData, null, 4));
    return defaultData;
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
