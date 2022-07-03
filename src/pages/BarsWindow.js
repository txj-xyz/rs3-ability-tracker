const Window = require('../base/Window.js')

module.exports = class Bars extends Window {
    constructor() {
        super()
            .create({ ...windows.properties, width: 355, height: 343 }, true)
            .ipcLoader(this.barsListener)
    }

    barsListener = (event, param) => {
        if (Array.isArray(param)) config.referenceStorage.bars = param.filter(bar => bar !== 'Global')
        else {
            config.referenceStorage.bars = [...config.referenceStorage.bars.filter(bar => ![param.before, param.after].includes(bar)), param.after]
            const keybinds = []
            config.referenceStorage.keybinds.map(keybind => keybinds.push({ ...keybind, bar: keybind.bar === param.before ? param.after : keybind.bar }))
            config.referenceStorage.keybinds = keybinds
        }
        if (!config.referenceStorage.bars.length) config.toggleSwitching = false

        windows.main?.webContents.send('fromBars', !Array.isArray(param) ? param : config.referenceStorage.bars)
        windows.keybinds?.webContents.send('fromBars', !Array.isArray(param) ? param : config.referenceStorage.bars)
        event.returnValue = null
    }
}
