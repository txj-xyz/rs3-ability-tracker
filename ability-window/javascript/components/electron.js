try {
    this.ipc = require('electron').ipcRenderer;
    this.request = ipc.sendSync
    this.log = (...data) => request('log', data)
    this.config = request('config')
    this.random = _ => request('random')
    this.success = true
} catch (e) {
    this.success = false
    throw new Error('Electron not found. This application was not initialized properly!')
}
