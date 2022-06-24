const { BrowserWindow, app } = require("electron");

module.exports = class Window {

    give(window) {
        this.window = window
        this.name = window.constructor.name.toLowerCase()
    }

    instanceCheck() {
        if (windows[this.name]) {
            windows[this.name].show();
            windows[this.name].focus();
            return true
        }
        else return false
    }

    create(param) {
        windows[this.name] = new BrowserWindow(param)
        windows[this.name].loadFile(page(this.name))
        windows[this.name].removeMenu()
        this.#emit('opened')
        this.#register()
    }

    #register() {
        windows[this.name].on('close', _ => {
            this.#emit('closed')
            switch (this.name) {
                case 'main': {
                    app.emit('window-all-closed');
                    break;
                }
            }
            delete windows[this.name]
        })
    }

    #emit(event) {
        for (const page in windows) ![this.name, 'properties', 'tray'].includes(page) ? windows[page].webContents.send(event, this.name) : void 0;
    }
}