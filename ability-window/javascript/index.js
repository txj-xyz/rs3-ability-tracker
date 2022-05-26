// Import dependencies.
const { ipcRenderer } = require('electron');

let abilityWindow = false

// Frontend to backend communication.
const openWindow = query => ipcRenderer.sendSync('open', query);

const updateConfig = query => ipcRenderer.sendSync('updateConfig', query);

const initialData = ipcRenderer.sendSync('updateConfig');

document.querySelector('label[cooldown] input').checked = initialData.trackCooldowns;
document.querySelector('label[ontop] input').checked = initialData.alwaysOnTop;

const slider = document.querySelector('input[type="range"]');
const label = document.querySelector('div[slider] p')

slider.value = initialData.numberOfIcons;
label.innerHTML = initialData.numberOfIcons;

slider.addEventListener('input', _ => {
    label.innerHTML = slider.value;
    updateConfig(slider.value);
})

function initialize() {
    const element = document.querySelector('div[ability]');
    if (!abilityWindow) {
        openWindow('ability');
        abilityWindow = !abilityWindow;
        element.innerHTML = 'Stop Tracker';
    } else {
        openWindow('closeAbility');
        abilityWindow = !abilityWindow;
        element.innerHTML = 'Start Tracker';
    }
}

ipcRenderer.on('closeAbility', _ => {
    abilityWindow = false;
    document.querySelector('div[ability]').innerHTML = 'Start Tracker';
})