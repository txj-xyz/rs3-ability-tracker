// Import dependencies.
const [Manager, { resolve }, { app }, { writeFileSync }] = ['../base/Manager.js', 'path', 'electron', 'fs'].map(require);

// Check if app is running in a dev environment.
module.exports = class Config extends Manager {
    static init() {
        const path = resolve(process.argv[2] === 'dev' ? '' : app.getPath('userData'), 'config.json')
        const config = super.file(path)
        if (config.barsSelection && !config.referenceStorage.bars.includes(config.barsSelection)) {
            config.barsSelection = 'Global'
            write()
        }

        const handler = {
            set(data, prop, receiver) {
                Reflect.set(...arguments);
                write()
                return true
            },
        };

        config.referenceStorage = new Proxy(config.referenceStorage, handler)

        return new Proxy(config, handler)

        function write() {
            writeFileSync(path, JSON.stringify(config, null, 2))
        }
    }
};
