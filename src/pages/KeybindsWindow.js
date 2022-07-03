const [{ copyFileSync, unlinkSync }, { resolve }, { dialog }, Window] = ['fs', 'path', 'electron', '../base/Window.js'].map(require)

module.exports = class Keybinds extends Window {
    constructor() {
        super()
            .create({ ...windows.properties, width: 635, height: 344 }, true)
            .ipcLoader(this.keybindsListener, this.barsEmit)
    }

    barsEmit = _ => null
    keybindsListener = (event, param) => {
        switch (param.type) {
            case 'revertImage': {
                unlinkSync(resolve(__dirname, '../../ability-window/assets', library.get(param.name).customIcon))
                library.set(param.name, null)
                break;
            }

            case 'dialog': {
                dialog.showOpenDialog({
                    title: 'Upload a new icon!',
                    defaultPath: resolve(__dirname, '../../ability-window/assets/.custom'),
                    buttonLabel: 'Upload',
                    filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }],
                    properties: __platform === 'darwin' ? ['openFile', 'createDirectory'] : ['openFile']
                }).then(file => {
                    if (!file.canceled) {
                        const id = randomID()
                        copyFileSync(file.filePaths[0].toString(), resolve(__dirname, `../../ability-window/assets/.custom/${id}.${file.filePaths[0].toString().split('.').pop()}`))
                        library.set(param.name, `../assets/.custom/${id}.${file.filePaths[0].toString().split('.').pop()}`)
                        windows.keybinds?.webContents.send('customIcon', { ...library.get(param.name), id: param.id })
                    }
                }).catch(console.log)
                break;
            }

            default: {
                let keybinds = new Map()
                for (let [key, value] of Object.entries(param)) {
                    let bind = keybinds.get(value.name)
                    if (bind) keybinds.set(value.name, { ...bind, keybind: [...bind.keybind, value.keybind] })
                    else keybinds.set(value.name, { ...value, keybind: [value.keybind] })
                }

                config.referenceStorage.keybinds = Array.from(keybinds, ([name, value]) => value)
                library.data.map(item => {
                    if (item.customIcon && !config.referenceStorage.keybinds.map(e => e.name).includes(item.name)) {
                        unlinkSync(resolve(__dirname, '../../ability-window/assets', library.get(item.name).customIcon))
                        library.set(item.name, null)
                    }
                })
                break;
            }
        }
        event.returnValue = null
    }
}
