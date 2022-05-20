// const { GlobalKeyboardListener } = require('node-global-key-listener')
const { app, BrowserWindow, globalShortcut } = require('electron')
const prompt = require('custom-electron-prompt')

function createWindow () {
  const win = new BrowserWindow({
    autoHideMenuBar: true,
    resizable: false,
    width: 300,
    height: 200
  })
  win.loadFile('index.html')
  const kb = ($value, $label, $default) => { return { value: $value, label: $label, default: $default } };
    prompt({
      title: "Keybinds",
      label: "Select keybind for each method",
      type: "keybind",
      value: "2", // Doesn't do anything here
      keybindOptions: [
        kb("slot1", "Primary bar slot 1", ""),
        kb("slot2", "Primary bar slot 2", ""),
        kb("slot3", "Primary bar slot 3", ""),
        kb("slot4", "Primary bar slot 4", ""),
        kb("slot5", "Primary bar slot 5", ""),
        kb("slot6", "Primary bar slot 6", ""),
      ],
      resizable: false,
    }, app).then(input => {
      if (input)
        input.forEach(obj => {
          if(obj.accelerator == '') return;
          console.log(obj)
          const ret = globalShortcut.register(obj.accelerator, () => {})
          if(!ret) return console.log('failed to register keybind')
        })
        console.log(input)
        console.log("Pressed Cancel");
    })
   .catch(console.error)
}

app.whenReady().then(() => {
  createWindow()
  // app.on('activate', () => {
  //   if (BrowserWindow.getAllWindows().length === 0) {
  //     createWindow()
  //   }
  // })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
