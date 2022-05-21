const { BrowserWindow, app } = require('electron')
const settings = require('./settings.js')
global.keys = require('../cfg/keybinds.json')

app
    .on('ready', settings)
    .on('activate', _ => !BrowserWindow.getAllWindows().length ? app.emit('ready') : void 0)
    .on('window-all-closed', _ => {
        if (process.platform === 'darwin') return
        app.isQuiting = true
        app.quit()
    })
