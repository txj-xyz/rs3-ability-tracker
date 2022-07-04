const { shell } = require('electron')

ipc.on('updateInformation', (event, param) => {
    document.querySelector('main div[update] p').innerHTML = param.tag.name;
    document.querySelector('main div[current] p').innerHTML = param.currentVersion;
    document.querySelector('div[buttons] div').onclick = _ => shell.openExternal(param.url)
})