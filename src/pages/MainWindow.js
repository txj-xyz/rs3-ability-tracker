const Window = require('../base/Window.js')

module.exports = class Main extends Window {
    constructor() {
        super()
            .create({ ...windows.properties, width: 700, height: 190 }, true)
            .ipcLoader('mainEmit', this.mainEmit)
            .ipcLoader('confListener', this.confListener)
    }

    mainEmit = _ => null
    confListener = _ => null
}
