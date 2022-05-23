const { BrowserWindow, ipcMain, globalShortcut } = require('electron')
const { existsSync, writeFileSync } = require('fs')

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
                event.returnValue = existsSync('./cfg/keybinds.json') ? require('../cfg/keybinds.json') : []
                break
            }
            case 'abilities': {
                event.returnValue = keys
                break
            }
            case 'binds': {
                keybindList = []
                param.binds.map(k => {
                    const req = keybindList.find(e => e.ability === k.ability)
                    if (req) req.key.push(k.key)
                    else keybindList.push({ ability: k.ability, key: [k.key] })
                })
                writeFileSync('./cfg/keybinds.json', JSON.stringify(keybindList, null, 4))
                event.returnValue = null
                break
            }
        }
    })
}