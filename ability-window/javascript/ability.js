// Import dependencies.
const { ipcRenderer } = require('electron'); 
const initialData = ipcRenderer.sendSync('updateConfig');

const refresh = count => {
    const main = document.querySelector('main');
    main.innerHTML = null;
    for (let i = count; i > 0; i--) main.innerHTML += `<div style="width:calc(100% / ${count})" id="icon-${i}"><div></div></div>`;
}

refresh(initialData.numberOfIcons);
ipcRenderer.on('refresh', (event, param) => refresh(param));