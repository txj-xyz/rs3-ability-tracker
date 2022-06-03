// Import dependencies.
const { ipcRenderer } = require('electron');

// Frontend to backend communication.
ipcRenderer.request = query => ipcRenderer.sendSync('keybinds', query);

// Request data from backend.
const keycache = ipcRenderer.request({ query: 'keycache' })

// Random ID generator.
const randomID = (sections, phrase, join, random = a => a[Math.floor(Math.random() * a.length)]) => [...Array(sections)].map(_ => [...Array(phrase)].map(_ => random([...[...Array(26)].map((_, i) => String.fromCharCode(i + 65)), ...[...Array(26)].map((_, i) => String.fromCharCode(i + 65).toLowerCase()), ...[...Array(10).keys()]])).join('')).join(join ?? '-')

let saveToggle = false;

const [keybinds, buttons] = [
    '<div id="ID" DISABLED><div onclick="remove(\'ID\')" style="background:#F04747" remove>-</div><input type="text" placeholder="Bar Name" value="BARNAME" /><p>COUNT</p></div>',
    '<div manage><div onclick="copy()" style="background:#00A9FF" button>+ New Bar</div><div onclick="save()" button save>Save</div></div>'
];

// Toggle save button.
const toggle = _ => {
    saveToggle = !saveToggle;
    const element = document.querySelector('div[save]')
    element.style.background = saveToggle ? '#43B581' : 'var(--elements)';
}

// Action for remove button.
const remove = (id, div = document.getElementById(id)) => {
    div.parentNode.removeChild(div);

    // Update save button.
    saveToggle ? toggle() : void 0;
}

function copy(name, count, read) {

    // Declare varibales.
    const [id, btns] = [randomID(5, 5), document.querySelector('div[manage]')];

    // Update preset element string values.
    const field = keybinds.replace(/ID/g, id).replace(/BARNAME/g, name || '').replace(/COUNT/g, count || 0).replace(/DISABLED/g, read ? 'disabled' : '');

    // Remove buttons.
    btns.parentNode.removeChild(btns);

    // Add new element and buttons.
    document.querySelector('div[keys]').insertAdjacentHTML('beforeend', field + buttons);

    document.getElementById(id).querySelector('input').addEventListener('change', _ => saveToggle ? toggle() : void 0);
}

let bars = {}

keycache.map(e => e.bar).map(e => !bars[e] ? bars[e] = 1 : bars[e] += 1)

copy('Global (Non-switching)', bars.Global, true)
delete bars.Global

for (const bar in bars) copy(bar, bars[bar])