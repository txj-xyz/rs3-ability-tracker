const { ipcMain } = require('electron')
const Window = require('../base/Window.js')

module.exports = class Main extends Window {
    constructor() {
        super()
        super.give(this)
        if (!super.instanceCheck()) super.create({ ...windows.properties, width: 700, height: 190 }, true)
        new Taskbar()
        this.#registerIPC()
    }

    #registerIPC() {
        ipcMain.on('mainEmit', (event, param) => {
            
        })

        ipcMain.on('confListener', (event, param) => {
            
        })
    }
}
