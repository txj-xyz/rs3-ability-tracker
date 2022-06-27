try {
    globalThis.ipc = require('electron').ipcRenderer;
    globalThis.request = ipc.sendSync
    globalThis.log = (...data) => request('log', data)
    globalThis.success = true
} catch (e) {
    globalThis.success = false
    throw new Error('Electron not found. This application was not initialized properly!')
}