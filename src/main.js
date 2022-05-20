// const { GlobalKeyboardListener } = require('node-global-key-listener')
const { app, BrowserWindow, globalShortcut } = require('electron')
const prompt = require('custom-electron-prompt')
const binds = [];

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
        kb("slot7", "Primary bar slot 7", ""),
        kb("slot8", "Primary bar slot 8", ""),
        kb("slot9", "Primary bar slot 9", ""),
        kb("slot10", "Primary bar slot 10", ""),
        kb("slot11", "Primary bar slot 11", ""),
        kb("slot12", "Primary bar slot 12", ""),
        kb("slot13", "Primary bar slot 13", ""),
        kb("slot14", "Primary bar slot 14", ""),

      ],
      resizable: false,
    }, app).then(input => {
      if (input) {
        console.log("inputs found from prompt: ", input)
        input.forEach(key => {
          if(key.accelerator !== ''){
            // TODO: tie the listeners we are creating here to the ability values (instead of 'slot1-14' tie each entry to a select drop down that is searchable)
            globalShortcut.register(key.accelerator, () => {
              console.log('key pressed:', key.accelerator)
            })
          }
        })
      } else {
        console.log('Cancelled prompt menu')
      }
    })
   .catch(console.error)

   
}

app.whenReady().then(() => {
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    globalShortcut.unregisterAll()
  }
})
