// const { GlobalKeyboardListener } = require('node-global-key-listener')
const { app, BrowserWindow } = require('electron')

function createWindow () {
  // const v = new GlobalKeyboardListener()
  // v.addListener(function (e, down) {
  //   console.log(e) TODO: Filter keys and start adding buttons and UI elements before starting key binds
  // });
  const win = new BrowserWindow({
    autoHideMenuBar: true,
    resizable: false,
    width: 300,
    height: 200
  })
  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
