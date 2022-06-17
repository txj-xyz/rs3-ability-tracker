// Import dependencies.
const [{ readdirSync, existsSync, writeFileSync }, { resolve }] = ['fs', 'path'].map(require);

// Load all modules into global.
module.exports = class Manager {

    // Loading logic.
    static load() {
        ['cfg', 'modules', 'pages'].map(dir => {
            readdirSync(resolve(__dirname, `../${dir}`)).map(file => {
                const module = require(resolve(__dirname, `../${dir}/${file}`));
                if (module.init) this[file.split('.').shift()] = module.init();
            });
        });
        return this;
    }

    // Import file with error catching logic.
    static file(path, data, failed = false) {
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
