// Import dependencies.
const { ipcRenderer } = require('electron');

// Frontend to backend communication.
const openWindow = query => ipcRenderer.sendSync('open', query);

const toggleSwitch = query => ipcRenderer.sendSync('toggle', query);

const initialData = ipcRenderer.sendSync('toggle');

document.querySelector('label[cooldown] input').checked = initialData.trackCooldowns;
document.querySelector('label[ontop] input').checked = initialData.alwaysOnTop;

const slider = document.querySelector('input[type="range"]');
const label = document.querySelector('div[slider] p')

slider.value = initialData.numberOfIcons;
label.innerHTML = initialData.numberOfIcons;

slider.addEventListener('input', _ => label.innerHTML = slider.value)
