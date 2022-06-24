const Window = require('../base/Window.js')

module.exports = class Main extends Window {
    constructor() {
        super()
            .create({ ...windows.properties, width: 700, height: 190 })
            .ipcLoader('mainListener', this.mainListener)
            .ipcLoader('confListener', this.confListener)
        if (!config.referenceStorage.keybinds.length) new Keybinds()
        else windows.main.on('ready-to-show', _ => new Main())
    }

    mainListener = _ => null
    confListener = _ => null
}
