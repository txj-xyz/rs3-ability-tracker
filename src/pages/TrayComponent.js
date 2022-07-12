const [{ resolve }, { Tray, Menu: { buildFromTemplate }, app, BrowserWindow: { getFocusedWindow }, globalShortcut, ipcMain }, uIOhook] = ['path', 'electron', 'uiohook-napi'].map(require)

module.exports = class Taskbar {
    constructor() {
        // new Confirmation()
        new Main()
        this.registers()
        if (windows.tray) return
        windows.tray = new Tray(resolve(__dirname, '../icons/icon.png'))
        windows.tray.setToolTip('Ability Tracker')
        this.events()
        windows.tray.reload = this.reload
        this.reload()
        uIOhook.start()
        process.platform === 'darwin' ? new Update() : void 0;
    }

    registers() {
        globalShortcut.unregisterAll()
        if (__devMode) globalShortcut.register('CommandOrControl+I', _ => getFocusedWindow().webContents.openDevTools({ mode: 'undocked' }))
    }

    events() {
        windows.tray.on('click', _ => __platform !== 'darwin' ? new Main() : void 0)
        ipcMain.on('platform', event => event.returnValue = __platform)
        ipcMain.on('devMode', event => event.returnValue = __devMode)
        ipcMain.on('config', (event, param) => event.returnValue = param ? { config: JSON.parse(JSON.stringify(config)), library: library.data, keycodes: keycodes.data } : JSON.parse(JSON.stringify(config)))
        ipcMain.on('random', event => event.returnValue = randomID())
        if (__platform !== 'darwin') {
            ipcMain.on('hide', (event, param) => {
                windows[param]?.blur()
                windows[param]?.minimize()
                event.returnValue = null
            })
            ipcMain.on('exit', (event, param) => event.returnValue = windows[param]?.close())
        }
    }

    reload() {
        if (windows.tray.isDestroyed()) return
        windows.tray.setContextMenu(
            buildFromTemplate([
                // Hide/Show main window.
                {
                    label: windows.main?.isVisible() ? 'Hide Menu' : 'Show Menu',
                    click: _ => {
                        windows.main?.isVisible() ? windows.main.hide() : new Main();
                        this.reload();
                    },
                },

                // Stop/Start Tracking.
                {
                    label: windows.ability ? 'Stop Tracker' : 'Start Tracker',
                    click: _ => {
                        if (windows.ability) {
                            windows.ability.close();
                            if (!windows.main?.isVisible()) new Main();
                        } else {
                            ability();
                            if (windows.main?.isVisible() && config.minimizeToTray) windows.main.hide();
                        }
                        this.reload();
                    },
                },

                // Open keybinds window.
                { label: 'Configure Keybinds', click: _ => new Keybinds() },

                // Open bars window.
                { label: 'Configure Bars', click: _ => new Bars() },

                // Quit application.
                { label: 'Quit', click: quitHandler },
            ])
        );
    }


}