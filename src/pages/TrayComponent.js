const [{ resolve }, { Tray, Menu: { buildFromTemplate }, app, BrowserWindow: { getFocusedWindow }, globalShortcut }] = ['path', 'electron'].map(require)

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
        if (devMode) globalShortcut.register('CommandOrControl+I', _ => getFocusedWindow().webContents.openDevTools({ mode: 'undocked' }))
    }

    events() {
        windows.tray.on('click', _ => new Main())
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