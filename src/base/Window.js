const { BrowserWindow, app, ipcMain } = require("electron");
const { windows } = require("./Manager");

module.exports = class Window {

    listeners = {}
    exists = false

    constructor() {
        this.name = this.constructor.name.toLowerCase()
        if (windows[this.name]) {
            windows[this.name].show();
            windows[this.name].focus();
            windows.tray.reload();
            this.exists = true
        }
        return this
    }

    create(param, show) {
        if (this.exists) return this
        windows[this.name] = new BrowserWindow(param)
        windows[this.name].loadFile(page(this.name))
        windows[this.name].removeMenu()
        !['main', 'ability'].includes(this.name) && windows['main'] ? this.centerToParent(this.name) : void 0;
        this.#register(show)
        return this
    }

    centerToParent(name) {
        const [_newBounds, _mainBounds] = [windows[name]?.getBounds() ?? null, windows['main']?.getBounds() ?? null];
        const offset = _newBounds && _mainBounds ? (_mainBounds.x - (_newBounds.width - _mainBounds.width) / 2) : null;
        windows[name].setPosition(parseInt(offset), _mainBounds.y + 10);
        windows[name].setParentWindow(windows['main']);
        // windows[name].setParentWindow(windows['main']);
        
        return offset;
    }

    ipcLoader(...events) {
        if (this.exists) return this
        for (const callback of events) {
            this.listeners[callback.name] = callback
            ipcMain.on(callback.name, callback)
        }
        return this
    }

    #register(show) {
        windows[this.name].on('ready-to-show', _ => {
            show ? new global[this.constructor.name]() : void 0;
            this.#emit('opened')
        })
        windows[this.name].on('close', _ => {
            if (this.name === 'main') {
                if (config.minimizeToTray || windows.keybinds || windows.bars) {
                    windows[this.name].hide()
                    if (!windows.main?.isVisible() && !windows.keybinds && !windows.bars) quitHandler()
                } else quitHandler()
            } else {
                if (this.name === 'ability') unregister()
                new Main()
                this.#emit('closed')
            }
            for (const event in this.listeners) ipcMain.removeListener(event, this.listeners[event])
            delete windows[this.name]
            windows.tray.reload()
            if (!windows.main?.isVisible() && !windows.keybinds && !windows.bars) quitHandler()
            return void 0
        })
    }

    #emit(event) {
        for (const page in windows) !['properties', 'tray'].includes(page) ? windows[page].webContents.send(event, this.name) : void 0;
    }
}