const [{ existsSync, mkdirSync, copyFileSync, unlinkSync }, { resolve }, { dialog }, Window] = ['fs', 'path', 'electron', '../base/Window.js'].map(require)

module.exports = class Keybinds extends Window {
    constructor() {
        super()
            .create({ ...windows.properties, width: 635, height: 344 }, true)
            .ipcLoader(this.keybindsListener)
        this.customPath = this.checkCustomFolder()
    }
    checkCustomFolder () {
        const customPath = resolve(__userData, '.custom');
        if(!existsSync(customPath)){
            mkdirSync(customPath)
        }
        return customPath;
    }

    keybindsListener = (event, param) => {
        switch (param.type) {
            case 'revertImage': {
                unlinkSync(library.get(param.name).customIcon)
                library.set(param.name, null)
                break;
            }

            case 'dialog': {
                dialog.showOpenDialog({
                    title: 'Upload a new icon!',
                    defaultPath: this.customPath,
                    buttonLabel: 'Upload',
                    filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }],
                    properties: __platform === 'darwin' ? ['openFile', 'createDirectory'] : ['openFile']
                }).then(file => {
                    if (!file.canceled) {
                        const id = randomID()
                        const path = resolve(this.customPath, `${id}.${file.filePaths[0].toString().split('.').pop()}`)
                        copyFileSync(file.filePaths[0].toString(), path)
                        library.set(param.name, path.replace(/\\/g, '/'))
                        windows.keybinds?.webContents.send('customIcon', { ...library.get(param.name), id: param.id })
                    }
                }).catch(console.log)
                break;
            }

            default: {
                config.referenceStorage.keybinds = param
                library.data.map(item => {
                    if (item.customIcon && !config.referenceStorage.keybinds.map(e => e.name).includes(item.name)) {
                        unlinkSync(library.get(item.name).customIcon)
                        library.set(item.name, null)
                    }
                })
                windows.bars?.webContents.send('fromKeybinds', config.referenceStorage.keybinds)
                break;
            }
        }
        event.returnValue = null
    }
}
