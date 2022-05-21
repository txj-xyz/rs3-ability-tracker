const { BrowserWindow } = require('electron')
const keybinds = require('./keybinds.js')

module.exports = _ => {
    const win = new BrowserWindow({
        autoHideMenuBar: true,
        titleBarStyle: 'hidden',
        resizable: false,
        show: false,
        width: 300,
        height: 200,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    win.loadFile('./ability-window/html/index.html')
    if (keys.filter(e => e.key.some(e => e)).length === 0) keybinds()
    else win.on('ready-to-show', win.show)
}
