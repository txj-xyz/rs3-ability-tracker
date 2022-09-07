// Import dependencies.
const [Manager, { resolve }, { app }, { writeFileSync }] = ['../base/Manager.js', 'path', 'electron', 'fs'].map(require);

// Check if app is running in a dev environment.
module.exports = class Config extends Manager {
    static init() {
        const path = resolve(super.__userData, 'config.json')
        const config = super.file(path)
        /*/if (config.barsSelection && !config.referenceStorage.bars.map(bar => bar?.name ? bar.name : bar).includes(config.barsSelection)) {
            config.barsSelection = 'Global'
            write()
        }*/

        const handler = {
            set(data, prop, receiver) {
                Reflect.set(...arguments);
                write()
                return true
            },
        };

        config.referenceStorage = new Proxy(config.referenceStorage, handler)
        config.abilityWindow = new Proxy(config.abilityWindow, handler)

        return new Proxy(config, handler)
        //We dont know what they do :shrug:
        //Bind to objects(variables) and updating a value, it will update everywhere.

        function write() {
            writeFileSync(path, JSON.stringify(config, null, 2))
        }
    }
};
