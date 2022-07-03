// Import dependencies.
const [Manager, { resolve }] = ['../base/Manager.js', 'path'].map(require);

// Check if app is running in a dev environment.
module.exports = class Keycodes extends Manager {
    static init() {
        const data = super.file(resolve(__dirname, '../cfg/keycodes.json'));
        const reverse = super.file(resolve(__dirname, '../cfg/reversed_keycodes.json'));
        const map = super.mapify(data);
        const reverseMap = super.mapify(reverse);
        return {
            data,
            reverse,
            reverseMap,
            map,
            get: query => map.get(query),
        };
    }
};
