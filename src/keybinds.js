const { BrowserWindow, ipcMain, globalShortcut } = require('electron')

module.exports = _ => {
    const win = new BrowserWindow({
        autoHideMenuBar: true,
        titleBarStyle: 'hidden',
        resizable: false,
        width: 450,
        height: 200,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    win.loadFile('./ability-window/html/keybinds.html')

    globalShortcut.register('CommandOrControl+Shift+I', _ => win.webContents.openDevTools({ mode: 'undocked' }))

    ipcMain.on('keybinds_request', (event, param) => {
        switch (param.query) {
            case 'keys': {
                event.returnValue = keys
                break
            }
            case 'binds': {

            }
        }
    })
}