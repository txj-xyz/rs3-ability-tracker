// Import dependencies.
const [{ readdirSync, existsSync, writeFileSync }, { resolve }] = ['fs', 'path'].map(require);

// Load all modules into global.
module.exports = class Manager {
    static windows = {
        properties: {
            icon: resolve(__dirname, '../icons/icon.png'),
            autoHideMenuBar: true,
            resizable: false,
            fullscreen: false,
            show: false,
            titleBarStyle: 'hidden',
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
        },
    };

    // Loading logic.
    static load() {
        this.once = this.once ? true : false;
        if (!this.once) {
            ['modules', 'pages']?.map(dir => {
                readdirSync(resolve(__dirname, `../${dir}`)).map(file => {
                    const Module = require(resolve(__dirname, `../${dir}/${file}`));
                    const globalVar = Module.name?.startsWith('_');
                    const name = (globalVar ? '_' : '') + (Module.init ? Module.name.slice(0, globalVar ? 2 : 1).toLowerCase() + Module.name.slice(globalVar ? 2 : 1) : Module.name);
                    this[name] = Module.init ? Module.init() : Module;
                });
            });
            this.once = true;
        }
        return this;
    }

    static checkConfig(oldConfig, newConfig) {
        let oldProps = Object.keys(oldConfig).filter(key => !['referenceStorage', 'abilityWindow'].includes(key));
        let newProps = Object.keys(newConfig).filter(key => !['referenceStorage', 'abilityWindow'].includes(key));
        let oldDiff = oldProps.filter(key => !newProps.includes(key)) || [];
        let keybinds = [];
        oldDiff.map(key => delete oldConfig[key]);
        let newDiff = newProps.filter(key => !oldProps.includes(key)) || [];
        newDiff.map(key => (oldConfig[key] = newConfig[key]));

        if (oldConfig.referenceStorage.keybinds.length && oldConfig.referenceStorage.keybinds[0].key) {
            oldConfig.referenceStorage.keybinds.map(k => {
                for (const entry of k.key) {
                    keybinds.push({ name: k.name.replace(/_/g, ' '), keybind: entry, bar: k.bar, perk: null });
                }
            });
            oldConfig.referenceStorage.keybinds = keybinds;

            oldConfig.abilityWindow.width = 800;
            oldConfig.abilityWindow.height = 80;
        }

        return oldConfig;
    }

    // Import file with error catching logic.
    static file(path) {
        let [failed, data] = [false];

        // Check if file exists.
        if (existsSync(path)) {
            // Check if file data is corrupted.
            try {
                data = require(path);
                if (path.endsWith('config.json')) {
                    data = this.checkConfig(require(path), require(resolve(__dirname, `../default/${path.replace(/\\/g, '/').split('/').pop()}`)));
                }
            } catch (e) {
                console.log(e)
                failed = true;
            }

            // If not corrupted, return data.
            if (!failed) return data;
        }

        

        // In any other case, load default data.
        try {
            data = require(resolve(__dirname, `../default/${path.replace(/\\/g, '/').split('/').pop()}`));
        } catch (e) {
            throw new Error(`Could not load default config file for ${path}:\n${e}`);
        }

        // Write data to file.
        writeFileSync(path, JSON.stringify(data, null, 2));
        return data;
    }

    static mapify(data, key) {
        const map = new Map();
        if (Array.isArray(data)) data.map(set => map.set(set[key], set));
        else {
            for (const key in data) map.set(key, data[key]);
        }
        return map;
    }

    // Default game configs.
    static rsOptions = {
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
};
