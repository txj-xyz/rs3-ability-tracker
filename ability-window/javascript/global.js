const { ipcRenderer } = require('electron');

function $(query) {
    return document.querySelector(`div.${query}`)
}

function log(param) {
    ipcRenderer.sendSync('log', param)
}

