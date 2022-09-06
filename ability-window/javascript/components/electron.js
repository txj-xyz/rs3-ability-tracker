const $ = (query, element) => (element ?? document).querySelector(query);
const $$ = (query, element) => (element ?? document).querySelectorAll(query);
const $$$ = (query, element) => (element ?? document).getElementById(query)

try {
    this.ipc = require('electron').ipcRenderer;
    this.request = ipc.sendSync
    this.config = request('config')
    this.random = _ => request('random')
    this.resolve = (...paths) => request('resolve', paths)
} catch (e) {
    throw new Error('Electron not found. This application was not initialized properly!')
}