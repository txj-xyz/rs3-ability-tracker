// Import dependencies.
const [{ readdirSync, existsSync, writeFileSync, mkdirSync, unlinkSync }, { resolve }, { app }, Store] = ['fs', 'path', 'electron', 'electron-store'].map(require);

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
                // nodeIntegrationInWorker: true, Multithreading experimental
                nodeIntegration: true,
                contextIsolation: false,
            },
        },
    };

    static __userData = app.getPath('userData');


    static checkCustomFolder(path) {
        if(typeof path !== 'string') return new TypeError('path must be a string')
        const customPath = resolve(super.__userData, path);
        if (!existsSync(customPath)) {
            mkdirSync(customPath);
        }
        return customPath;
    }
    
    // Load storage
    // static __localStorage = new Store({ name: 'local_storage' });

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

    // Update AppData assets with new files from generated on build assets (aka: new icons)
    static checkAssets(oldAssets, newAssets) {
        let oldProps = oldAssets.map(set => set.name);
        let newProps = newAssets.map(set => set.name);

        const oldMap = this.mapify(oldAssets, 'name');
        const newMap = this.mapify(newAssets, 'name');

        let oldDiff = oldProps.map(key => (!newMap.get(key) ? key : null)).filter(e => e);
        oldDiff.map(key => oldMap.delete(key));
        let newDiff = newProps.map(key => (!oldMap.get(key) ? key : null)).filter(e => e);
        newDiff.map(key => oldMap.set(key, newMap.get(key)));

        const merged = Array.from(oldMap.values());

        merged.map(set => {
            let newSet = newMap.get(set.name)
            set.style = newSet.style;
            set.icon = newSet.icon;
            set.title = newSet.title;
        })

        readdirSync(this.checkCustomFolder('.custom')).map(file => {
            const filepath = resolve(this.checkCustomFolder('.custom'), file).replace(/\\/g, '/');
            if (!merged.find(set => set.customIcon === filepath)) unlinkSync(filepath);
        });

        return merged;
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

        if (typeof oldConfig.referenceStorage.bars[0] === 'string') {
            oldConfig.referenceStorage.bars = oldConfig.referenceStorage.bars.map(bar => ({ name: bar, key: null }));
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
                    writeFileSync(path, JSON.stringify(data, null, 2));
                } else if (path.endsWith('game-key-data.json')) {
                    data = this.checkAssets(require(path), require(resolve(__dirname, `../default/${path.replace(/\\/g, '/').split('/').pop()}`)));
                    writeFileSync(path, JSON.stringify(data, null, 2));
                }
            } catch (e) {
                console.log(e);
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
        spamCooldown: 2000,
    };
};
