// Import dependencies.
const [{ readdirSync, existsSync, writeFileSync }, { resolve }] = ['fs', 'path'].map(require);

// Load all modules into global.
module.exports = class Manager {

    static windows = {
        properties: {
            icon: resolve(__dirname, '../icons/icon.png'),
            autoHideMenuBar: true,
            resizable: false,
            show: false,
            titleBarStyle: 'hidden',
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
            },
        },
    }

    // Loading logic.
    static load() {
        this.once = this.once ? true : false
        if (!this.once) {
            ['modules', 'pages']?.map(dir => {
                readdirSync(resolve(__dirname, `../${dir}`)).map(file => {
                    const Module = require(resolve(__dirname, `../${dir}/${file}`));
                    const name = Module.init ? Module.name.slice(0, 1).toLowerCase() + Module.name.slice(1) : Module.name;
                    this[name] = Module.init ? Module.init() : Module;
                });
            });
            this.once = true
        }
        return this;
    }

    // Import file with error catching logic.
    static file(path) {
        let [failed, data] = [false]
        // Check if file exists.
        if (existsSync(path)) {
            // Check if file data is corrupted.
            try {
                data = require(path);
            } catch (e) {
                failed = true;
            }

            // If not corrupted, return data.
            if (!failed) return data;
        }

        // In any other case, load default data.
        try {
            data = require(resolve(__dirname, `../defaults/${path.split('/').pop()}`));
        } catch (e) {
            throw new Error(`Could not load default config file for ${path}: ${e}`);
        }

        // Write data to file.
        writeFileSync(path, JSON.stringify(data, null, 2));
        return data;
    }

    static mapify(data, key) {
        const map = new Map()
        if (Array.isArray(data)) data.map(set => map.set(set[key], set))
        else {
            for (const key in data) map.set(key, data[key])
        }
        return map
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
