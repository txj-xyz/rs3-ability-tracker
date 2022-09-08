const { BrowserWindow, app, ipcMain, screen } = require("electron");

module.exports = class Window {

    listeners = {}
    exists = false

    constructor() {
        //Constructor for a window.
        this.name = this.constructor.name.toLowerCase()
        //Setting the name of the window
        if (windows[this.name]) {
            windows[this.name].show();
            //Show the window
            windows[this.name].focus();
            //Bring it to focus
            windows.tray.reload();
            //Reload the tray
            this.exists = true;
            //Now it exists...?
        }
        return this
    }

    create(param, show) {
        //Creating a window
        if (this.exists) return this
        //If the window already exsists, return the window.
        windows[this.name] = new BrowserWindow(param)
        //Window is equal the new window of given param name.
        !['main', 'ability'].includes(this.name) && windows['main'] ? tools.centerToParent(windows[this.name]) : void 0;
        //No clue what this does, but it isn't important. Just something with centering and bringing the window into focus
        windows[this.name].loadFile(page(this.name))
        //Loading the fie onto the window of the same name
        windows[this.name].removeMenu()
        //Removing the window from the top
        this.#register(show)
        //Calls the private function 'register'
        return this
    }

    ipcLoader(...events) {
        if (this.exists) return this
        //If it already exists, return the window
        for (const callback of events) {
            this.listeners[callback.name] = callback
            ipcMain.on(callback.name, callback)
        }
        return this
        //Return the window.
    }

    #register(show) {
        //Private method register
        windows[this.name].on('ready-to-show', _ => {
            show ? new global[this.constructor.name]() : void 0;
            this.#emit('opened')
            //When the window is ready > Show it and emit a opened notification
        })
        windows[this.name].on('close', _ => {
            //When the window closes >
            if (this.name === 'main') {
                //If function is main
                if (config.minimizeToTray || windows.presets || windows.bars) {
                    windows[this.name].hide()
                    if (!windows.main?.isVisible() && !windows.presets && !windows.bars) quitHandler()
                } else quitHandler()
                //Options for closing/minimizing the tray
            } else {
                //Creating a new Global[] found in src/modules/UnregisterManager.js
                if (this.name === 'ability') unregister() 
                new Main()
                this.#emit('closed')
                //If the window is "ability" creat a new Main() and emit a closed message.
            }
            for (const event in this.listeners) ipcMain.removeListener(event, this.listeners[event])
            delete windows[this.name]
            windows.tray.reload()
            if (!windows.main?.isVisible() && !windows.presets && !windows.bars) quitHandler()
            return void 0
            //This line emits events for each window if we need it
        })
    }

    #emit(event) {
        for (const page in windows) !['properties', 'tray'].includes(page) ? windows[page].webContents.send(event, this.name) : void 0;
        //Notification System
    }
}