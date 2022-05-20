// const { GlobalKeyboardListener } = require('node-global-key-listener')
const { app, BrowserWindow } = require('electron')
const prompt = require('custom-electron-prompt')

function createWindow () {
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
  
    const kb = ($value, $label, $default) => { return { value: $value, label: $label, default: $default } };
    prompt({
      title: "Keybinds",
      label: "Select keybind for each method",
      type: "keybind",
      value: "2", // Doesn't do anything here
      keybindOptions: [
        { value: "volumeUp", label: "Increase Volume", default: "Shift+PageUp" },
        kb("volumeDown", "Decrease Volume", "Shift+PageDown"),
        kb("playPause", "Play / Pause") // (null || empty string || undefined) == no default
      ],
      resizable: false,
    }, app).then(input => {
      if (input)
        input.forEach(obj => console.log(obj))
      else
        console.log("Pressed Cancel");
    })
   .catch(console.error)
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
