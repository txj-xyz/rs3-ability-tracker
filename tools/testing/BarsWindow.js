const Window = require('../../src/base/Window.js')

module.exports = class Bars extends Window {
    constructor() {
        super()
            .create({ ...windows.properties, width: 555, height: 373 }, true)
            .ipcLoader(this.barsListener)
    }

    barsListener = (event, param) => {
        if (Array.isArray(param)) {
            config.referenceStorage.bars = param.filter(bar => bar?.name ? bar.name !== 'Global' : bar !== 'Global')
        }
        else {
            config.referenceStorage.bars = [...config.referenceStorage.bars.filter(bar => ![param.before, param.after].includes(bar.name)), param.after ? { name: param.after, key: param.key } : void 0].filter(e => e ? e : void 0)
            const keybinds = []
            !param.after ? config.referenceStorage.keybinds.map(keybind => keybind.bar !== param.before ? keybinds.push(keybind) : void 0) : config.referenceStorage.keybinds.map(keybind => keybinds.push({ ...keybind, bar: keybind.bar === param.before ? param.after : keybind.bar }))
            config.referenceStorage.keybinds = keybinds
        }
        if (!config.referenceStorage.bars.length) config.toggleSwitching = false

        windows.main?.webContents.send('fromBars', !Array.isArray(param) ? param : config.referenceStorage.bars)
        windows.presets?.webContents.send('fromBars', !Array.isArray(param) ? param : config.referenceStorage.bars)
        event.returnValue = null
    }
}
