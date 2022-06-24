// Import dependencies.
const [Manager, { resolve }, { writeFileSync }] = ['../base/Manager.js', 'path', 'fs'].map(require);

// Check if app is running in a dev environment.
module.exports = class Library extends Manager {
    static init() {
        const path = resolve(__dirname, `../cfg/game-key-data.json`)
        const data = super.file(path)
        const map = super.mapify(data, 'name')
        return {
            data,
            map,
            get: query => map.get(query),
            set: (query, icon) => {
                const index = data.findIndex(set => set.name === query)
                data[index].customIcon = icon
                return writeFileSync(path, JSON.stringify(data, null, 2))
            }
        }
    }
};
