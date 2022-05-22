const { BrowserWindow, app } = require('electron')
global.settings = require('./main.js')
global.keys = require('../cfg/abilities.json')

app
    .on('ready', settings)
    .on('activate', _ => !BrowserWindow.getAllWindows().length ? app.emit('ready') : void 0)
    .on('window-all-closed', _ => {
        app.isQuiting = true
        app.quit()
    })
