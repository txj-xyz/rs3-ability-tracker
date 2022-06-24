// Import dependencies.
const [Manager, { resolve }, { app }, { writeFileSync }] = ['../base/Manager.js', 'path', 'electron', 'fs'].map(require);

// Check if app is running in a dev environment.
module.exports = class Config extends Manager {
    static init() {
        const path = resolve(process.argv[2] === 'dev' ? '' : app.getPath('userData'), 'config.json')
        const config = super.file(path)
        const handler = {
            set(data, prop, receiver) {
                Reflect.set(...arguments);
                return writeFileSync(path, JSON.stringify(config, null, 2))
            },
        };
        return new Proxy(config, handler)
    }
};
