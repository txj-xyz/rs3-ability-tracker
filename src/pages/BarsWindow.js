const Window = require('../base/Window.js')

module.exports = class Bars extends Window {
    constructor() {
        super()
            .create({ ...windows.properties, width: 355, height: 350 }, true)
            .ipcLoader(this.barsListener, this.keybindsEmit)
    }

    barsListener = _ => null
    keybindsEmit = _ => null
}
