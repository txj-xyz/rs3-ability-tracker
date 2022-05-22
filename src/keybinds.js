const { BrowserWindow, ipcMain, globalShortcut } = require('electron')

module.exports = _ => {
    const win = new BrowserWindow({
        autoHideMenuBar: true,
        // titleBarStyle: 'hidden',
        resizable: false,
        width: 460,
        height: 350,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    win.loadFile('./ability-window/html/keybinds.html')

    win.on('close', _ => settings.show())

    globalShortcut.register('CommandOrControl+Shift+I', _ => win.webContents.openDevTools({ mode: 'undocked' }))

    ipcMain.on('keybinds_request', (event, param) => {
        switch (param.query) {
            case 'keys': {
                event.returnValue = keys
                break
            }
            case 'binds': {
                keys.map(p => p.key = [])
                param.binds.map(k => {
                    const req = keys.find(e => e.ability === k.ability)
                    if (req) req.key.push(k.key)
                })

                require('fs').writeFileSync('./cfg/keybinds.json', JSON.stringify(keys, null, 4))
                event.returnValue = null
                break
            }
        }
    })
}