const { BrowserWindow } = require('electron')
const keybinds = require('./keybinds.js')
let win

module.exports = _ => {
    win = new BrowserWindow({
        autoHideMenuBar: true,
        // titleBarStyle: 'hidden',
        resizable: false,
        show: false,
        width: 700,
        height: 200,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    win.loadFile('./ability-window/html/index.html')
    keybinds()
    // if (keys.filter(e => e.key.some(e => e)).length === 0) keybinds()
    // else win.on('ready-to-show', win.show)
}

module.exports.show = _ => !win.isVisible() ? win.show() : void 0
