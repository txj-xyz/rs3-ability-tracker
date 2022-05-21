const { ipcRenderer } = require('electron')
ipcRenderer.get = query => ipcRenderer.sendSync('keybinds_request', query)
console.log(ipcRenderer.get({ query: 'keys' }))
