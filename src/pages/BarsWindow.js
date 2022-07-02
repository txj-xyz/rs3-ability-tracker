const Window = require('../base/Window.js')

module.exports = class Bars extends Window {
    constructor() {
        super()
            .create({ ...windows.properties, width: 355, height: 343 }, true)
            .ipcLoader(this.barsListener, this.keybindsEmit)
    }

    barsListener = (event, param) => {
        if (Array.isArray(param)) config.referenceStorage.bars = param
        else config.referenceStorage.bars = [...config.referenceStorage.bars.filter(bar => ![param.before, param.after].includes(bar)), param.after]
        event.returnValue = null
    }
    keybindsEmit = _ => null
}
