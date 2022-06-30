const [{ resolve }, { Tray, Menu: { buildFromTemplate }, app, BrowserWindow: { getFocusedWindow }, globalShortcut, ipcMain }] = ['path', 'electron'].map(require)

module.exports = class Taskbar {
    constructor() {
        new Main()
        this.registers()
        if (windows.tray) return
        windows.tray = new Tray(resolve(__dirname, '../icons/icon.png'))
        windows.tray.setToolTip('Ability Tracker')
        this.events()
        windows.tray.reload = this.reload
        // this.reload()
    }

    registers() {
        globalShortcut.unregisterAll()
        if (__devMode) globalShortcut.register('CommandOrControl+I', _ => getFocusedWindow().webContents.openDevTools({ mode: 'undocked' }))
    }

    events() {
        windows.tray.on('click', _ => new Main())
        ipcMain.on('log', (event, param) => event.returnValue = console.log('[FE LOG]:', ...param))
        ipcMain.on('platform', event => event.returnValue = __platform)
        ipcMain.on('devMode', event => event.returnValue = __devMode)
        ipcMain.on('config', event => event.returnValue = JSON.parse(JSON.stringify(config)))
        ipcMain.on('random', event => event.returnValue = randomID())
        ipcMain.on('hide', (event, param) => {
            windows[param]?.blur()
            windows[param]?.minimize()
            event.returnValue = null
        })
        ipcMain.on('exit', (event, param) => {
            if (param === 'main') !config.minimizeToTray ? quitHandler() : windows[param].hide()
            else {
                windows[param]?.close()
                delete windows[param]
            }
            event.returnValue = null
        })
    }

    reload() {
        windows.tray.setContextMenu(
            buildFromTemplate([
                // Hide/Show main window.
                {
                    label: windows.main.isVisible() ? 'Hide Menu' : 'Show Menu',
                    click: _ => {
                        windows.main.isVisible() ? windows.main.hide() : windows.main.show();
                        this.reload();
                    },
                },

                // Stop/Start Tracking.
                {
                    label: windows.ability ? 'Stop Tracker' : 'Start Tracker',
                    click: _ => {
                        if (windows.ability) {
                            windows.ability.close();
                            if (!windows.main.isVisible()) windows.main.show();
                        } else {
                            ability();
                            if (windows.main.isVisible() && config.minimizeToTray) windows.main.hide();
                        }
                        this.reload();
                    },
                },

                // Open keybinds window.
                { label: 'Configure Keybinds', click: keybinds },

                // Open bars window.
                { label: 'Configure Bars', click: bars },

                // Quit application.
                { label: 'Quit', click: _ => app.emit('window-all-closed') },
            ])
        );
    }


}