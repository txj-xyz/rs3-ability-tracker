const [{ resolve }, { Tray, Menu: { buildFromTemplate }, app }] = ['path', 'electron'].map(require)

module.exports = class Taskbar {
    constructor() {
        windows.tray = new Tray(resolve(__dirname, '../icons/icon.png'))
        windows.tray.setToolTip('Ability Tracker')
        this.events()
        // this.reload()
    }

    events() {
        windows.tray.on('click', _ => {
            if (windows.main) {
                windows.main.show()
                windows.main.focus()
                // this.reload()
            }
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