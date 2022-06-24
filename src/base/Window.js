const { BrowserWindow, app, ipcMain } = require("electron");

module.exports = class Window {

    listeners = {}
    exists = false

    constructor() {
        this.name = this.constructor.name.toLowerCase()
        if (windows[this.name]) {
            windows[this.name].show();
            windows[this.name].focus();
            // windows.tray.reload();
            this.exists = true
        }
        return this
    }

    create(param, show) {
        if (this.exists) return this
        windows[this.name] = new BrowserWindow(param)
        windows[this.name].loadFile(page(this.name))
        windows[this.name].removeMenu()
        this.#emit('opened')
        this.#register(show)
        return this
    }

    close() {
        windows[this.name].close()
    }

    ipcLoader(event, callback) {
        if (this.exists) return this
        this.listeners[event] = callback
        ipcMain.on(event, callback)
        return this
    }

    #register(show) {
        if (show) windows[this.name].on('ready-to-show', _ => new global[this.constructor.name]())
        windows[this.name].on('close', _ => {
            this.#emit('closed')
            for (const event in this.listeners) ipcMain.removeListener(event, this.listeners[event])
            if (this.name === 'main') app.emit('window-all-closed')
            else new Main()
            delete windows[this.name]
        })
    }

    #emit(event) {
        for (const page in windows) ![this.name, 'properties', 'tray'].includes(page) ? windows[page].webContents.send(event, this.name) : void 0;
    }
}