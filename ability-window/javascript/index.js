// Import dependencies.
const { ipcRenderer } = require('electron');
const modifiers = ['Shift', 'Control', 'Ctrl', 'Command', 'Cmd', 'Alt', 'AltGr', 'Super', 'Backspace'];

let abilityWindow = false

// Frontend to backend communication.
const openWindow = query => ipcRenderer.sendSync('open', query);
const updateConfig = query => ipcRenderer.sendSync('updateConfig', query);

// Get data.
const initialData = ipcRenderer.sendSync('updateConfig');

let bars = ['Global', ...initialData.referenceStorage.bars];

// Update frontend content with data.
document.querySelector('label[cooldown] input').checked = initialData.trackCooldowns;
document.querySelector('label[ontop] input').checked = initialData.alwaysOnTop;
document.querySelector('label[tray] input').checked = initialData.minimizeToTray;
if (initialData.barsSelection) document.querySelector('div[selector] input').value = initialData.barsSelection;

// Get input types.
const slider = document.querySelector('input[type="range"]');
const label = document.querySelector('div[slider] p')

// Set vales.
slider.value = initialData.numberOfIcons;
label.innerHTML = initialData.numberOfIcons;

// Listen for updates.
slider.addEventListener('input', _ => {
    label.innerHTML = slider.value;
    updateConfig(slider.value);
})

// Tracker triggers.
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

// Stop tracker.
ipcRenderer.on('closeAbility', _ => {
    abilityWindow = false;
    document.querySelector('div[ability]').innerHTML = 'Start Tracker';
})

// Spacing for toggles.
let i = 0;
document.querySelectorAll('div[toggle] label').forEach(element => {
    element.style.marginTop = `${i * 30}px`;
    i++
})

// Dropdown input manager class.
class Dropdown {
    constructor(div) {
        this.id = div.id;
        this.input = div.querySelector('div[selector] input');
        this.dropdown = div.querySelector('div[dropdown]');
        this.dropdown.innerHTML = this.search();
        this.init();
    }

    // Initialize dropdown listener.
    init() {

        this.input.value = initialData.barsSelection

        // When input is received from the input box, check if it is a valid character and then filter the list.
        this.input.addEventListener('input', e => {
            !modifiers.includes(e.key) ? this.dropdown.innerHTML = this.search(this.input.value) : void 0;
            updateConfig([this.input.value]);
        });

        // Show dropdown when input box is clicked.
        this.input.addEventListener('focus', _ => this.dropdown.style.display = 'block');

        // Hide dropdown when input box focus is lost.
        this.input.addEventListener('blur', _ => setTimeout(_ => this.dropdown.style.display = 'none', 150));
    }

    // Filter the list.
    search(query) {

        // NOTE: TEMP LIST.... REMOVE WHEN DONE.
        let list = bars;

        // Filter the list.
        list = query ? list.filter(e => e.toLowerCase().includes(query.toLowerCase())) : list;

        // Convert string to HTML.
        const result = [];
        list.map(e => result.push(`<div onclick="update('${e}')" title="${e}">${e}</div>`));

        // Return list.
        return result.length ? result.join('') : '<div>No results</div>';
    }
}

// Dropdown for bar selection.
let bar = new Dropdown(document.querySelector('div[bars]'));

// Incoming data event.
ipcRenderer.on('passToKeys', (event, arg) => {

    // Update dropdown.
    bars = [...new Set(['Global', ...arg.filter(e => e)])]
    bar.dropdown.innerHTML = bar.search();
})

// Update the config for bar selection.
const update = query => {
    document.querySelector('div[selector] input').value = query;
    updateConfig(`bars-${query}`);
}
