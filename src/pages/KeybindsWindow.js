const Window = require('../base/Window.js')

module.exports = class Keybinds extends Window {
    constructor() {
        super()
            .create({ ...windows.properties, width: 635, height: 350 }, true)
            .ipcLoader(this.keybindsListener, this.barsEmit)
    }

    barsEmit = _ => null
    keybindsListener = _ => null
}
