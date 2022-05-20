// const { GlobalKeyboardListener } = require('node-global-key-listener')
const { app, BrowserWindow } = require('electron')
const prompt = require('custom-electron-prompt')

function createWindow () {
  // const win = new BrowserWindow({
  //   autoHideMenuBar: true,
  //   resizable: false,
  //   width: 300,
  //   height: 200
  // })
  const kb = ($value, $label, $default) => { return { value: $value, label: $label, default: $default } };
    prompt({
      title: "Keybinds",
      label: "Select keybind for each method",
      type: "keybind",
      value: "2", // Doesn't do anything here
      keybindOptions: [
        kb("volumeDown", "Primary bar slot 1", ""),
        kb("volumeDown", "Primary bar slot 2", ""),
        kb("volumeDown", "Primary bar slot 3", ""),
        kb("volumeDown", "Primary bar slot 4", ""),
        kb("volumeDown", "Primary bar slot 5", ""),
        kb("volumeDown", "Primary bar slot 6", ""),
      ],
      resizable: false,
    }, app).then(input => {
      if (input)
        input.forEach(obj => console.log(obj))
      else
        console.log("Pressed Cancel");
    })
   .catch(console.error)
  // win.loadFile('index.html')
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
