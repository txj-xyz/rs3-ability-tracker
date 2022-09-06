const { shell } = require('electron')

ipc.on('updateInformation', (event, param) => {
    $('main div[update] p').innerHTML = param.tag.name;
    $('main div[current] p').innerHTML = param.currentVersion;
    $('div[buttons] div').onclick = _ => shell.openExternal(param.url)
})