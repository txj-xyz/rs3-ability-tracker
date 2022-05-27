// Import dependencies.
const { ipcRenderer } = require('electron');

// Frontend to backend communication.
ipcRenderer.request = query => ipcRenderer.sendSync('keybinds', query);

// Request data from backend.
const [keycache, abilities] = ['keycache', 'abilities'].map(query => ipcRenderer.request({ query }));

// Default values.
const modifiers = ['Shift', 'Control', 'Ctrl', 'Command', 'Cmd', 'Alt', 'AltGr', 'Super', 'Backspace'];
const keycodes = {
    ShiftLeft: 'Shift',
    ShiftRight: 'Shift',
    ControlLeft: 'Ctrl',
    ControlRight: 'Ctrl',
    AltLeft: 'Alt',
    AltRight: 'Alt',
    MetaLeft: 'Super',
    MetaRight: 'Super',
    NumLock: 'NumLock',
    NumpadDivide: 'NumDiv',
    NumpadMultiply: 'NumMult',
    NumpadSubtract: 'NumSub',
    NumpadAdd: 'NumAdd',
    NumpadDecimal: 'NumDec ',
    Numpad0: 'Num0',
    Numpad1: 'Num1',
    Numpad2: 'Num2',
    Numpad3: 'Num3',
    Numpad4: 'Num4',
    Numpad5: 'Num5',
    Numpad6: 'Num6',
    Numpad7: 'Num7',
    Numpad8: 'Num8',
    Numpad9: 'Num9',
    Digit0: '0',
    Digit1: '1',
    Digit2: '2',
    Digit3: '3',
    Digit4: '4',
    Digit5: '5',
    Digit6: '6',
    Digit7: '7',
    Digit8: '8',
    Digit9: '9',
    Minus: '-',
    Equal: '=',
    KeyQ: 'Q',
    KeyW: 'W',
    KeyE: 'E',
    KeyR: 'R',
    KeyT: 'T',
    KeyY: 'Y',
    KeyU: 'U',
    KeyI: 'I',
    KeyO: 'O',
    KeyP: 'P',
    KeyA: 'A',
    KeyS: 'S',
    KeyD: 'D',
    KeyF: 'F',
    KeyG: 'G',
    KeyH: 'H',
    KeyJ: 'J',
    KeyK: 'K',
    KeyL: 'L',
    KeyZ: 'Z',
    KeyX: 'X',
    KeyC: 'C',
    KeyV: 'V',
    KeyB: 'B',
    KeyN: 'N',
    KeyM: 'M',
    BracketLeft: '[',
    BracketRight: ']',
    Semicolon: ';',
    Quote: '\'',
    Backquote: '`',
    Backslash: '\\',
    Comma: ',',
    Period: '.',
    Slash: '/',
    Plus: '+',
    Space: 'Space',
    Tab: 'Tab',
    Backspace: 'Backspace',
    Delete: 'Delete',
    Insert: 'Insert',
    Return: 'Return',
    Enter: 'Enter',
    ArrowUp: 'Up',
    ArrowDown: 'Down',
    ArrowLeft: 'Left',
    ArrowRight: 'Right',
    Home: 'Home',
    End: 'End',
    PageUp: 'PageUp',
    PageDown: 'PageDown',
    Escape: 'Escape',
    AudioVolumeUp: 'VolumeUp',
    AudioVolumeDown: 'VolumeDown',
    AudioVolumeMute: 'VolumeMute',
    MediaTrackNext: 'MediaNextTrack',
    MediaTrackPrevious: 'MediaPreviousTrack',
    MediaStop: 'MediaStop',
    MediaPlayPause: 'MediaPlayPause',
    ScrollLock: 'ScrollLock',
    PrintScreen: 'PrintScreen',
    F1: 'F1',
    F2: 'F2',
    F3: 'F3',
    F4: 'F4',
    F5: 'F5',
    F6: 'F6',
    F7: 'F7',
    F8: 'F8',
    F9: 'F9',
    F10: 'F10',
    F11: 'F11',
    F12: 'F12',
    F13: 'F13',
    F14: 'F14',
    F15: 'F15',
    F16: 'F16',
    F17: 'F17',
    F18: 'F18',
    F19: 'F19',
    F20: 'F20',
    F21: 'F21',
    F22: 'F22',
    F23: 'F23',
    F24: 'F24'
};
const [keybinds, buttons] = [
    '<div id="ID"><div onclick="remove(\'ID\')" style="background:#F04747" remove>-</div><div ability><input type="text" placeholder="Ability" value="ABILITY" /><div dropdown></div></div><input type="text" placeholder="Keybind" value="KEYBIND" key /></div>',
    '<div manage><div onclick="copy()" style="background:#00A9FF" button>+ New Bind</div><div onclick="save()" button save>Save</div></div>'
];
let saveToggle = false;

// Random ID generator.
const randomID = (sections, phrase, join, random = a => a[Math.floor(Math.random() * a.length)]) => [...Array(sections)].map(_ => [...Array(phrase)].map(_ => random([...[...Array(26)].map((_, i) => String.fromCharCode(i + 65)), ...[...Array(26)].map((_, i) => String.fromCharCode(i + 65).toLowerCase()), ...[...Array(10).keys()]])).join('')).join(join ?? '-')

// Update input box value from dropdown selection.
const update = (id, ability, input = document.getElementById(id).querySelector('div[ability] input')) => input.value = ability;

// Action for remove button.
const remove = (id, div = document.getElementById(id)) => {
    div.parentNode.removeChild(div);

    // Update save button.
    saveToggle ? toggle() : void 0;
}

// Toggle save button.
const toggle = _ => {
    saveToggle = !saveToggle;
    const element = document.querySelector('div[save]')
    element.style.background = saveToggle ? '#43B581' : 'var(--elements)';
}

// Kebind input manager class.
class Keybind {
    constructor(input) {
        this.key;
        this.modify = [];
        this.input = input;
        this.init();
    }

    // Initialize keybind listener.
    init() {
        this.input.addEventListener('focus', _ => {
            this.input.classList.contains('error') ? this.input.classList.remove('error') : void 0;
            this.input.setAttribute('placeholder', 'Listening...');
        });
        this.input.addEventListener('blur', _ => this.input.setAttribute('placeholder', 'Keybind'));
        this.input.addEventListener('keydown', e => {

            // Prevent default action.
            e.preventDefault();

            // Update save button.
            saveToggle ? toggle() : void 0;

            // If backspace is pressed, remove from list.
            if (keycodes[e.code || e.key] === 'Backspace') this.key ? this.key = null : this.modify.pop();

            // Check if modifier is pressed.
            else if (modifiers.includes(keycodes[e.code || e.key]) && this.modify.length < 2 && !this.modify.includes(keycodes[e.code || e.key])) this.modify.push(keycodes[e.code || e.key]);

            // Check if key is pressed.
            else if (!this.modify.includes(keycodes[e.code || e.key])) this.key = keycodes[e.code || e.key];

            // Update frontend.
            this.write();
        })
    }

    // Update frontend.
    write() {

        // String builder.
        let result = '';

        // Add modifiers.
        if (this.modify.length > 0) this.modify.map(e => result += e + ' + ');

        // Add key.
        if (this.key) result += this.key

        // Show result.
        this.input.value = result
    }
}

// Dropdown input manager class.
class Dropdown {
    constructor(div) {
        this.id = div.id;
        this.input = div.querySelector('div[ability] input');
        this.dropdown = div.querySelector('div[dropdown]');
        this.dropdown.innerHTML = this.search();
        this.init();
    }

    // Initialize dropdown listener.
    init() {
        // When input is received from the input box, check if it is a valid character and then filter the list.
        this.input.addEventListener('input', e => {
            !modifiers.includes(e.key) ? this.dropdown.innerHTML = this.search(this.input.value) : void 0;

            // Update save button.
            saveToggle ? toggle() : void 0;
        });

        // Show dropdown when input box is clicked.
        this.input.addEventListener('focus', _ => {
            this.dropdown.style.display = 'block';
            this.input.classList.contains('error') ? this.input.classList.remove('error') : void 0;
        });

        // Hide dropdown when input box focus is lost.
        this.input.addEventListener('blur', _ => setTimeout(_ => this.dropdown.style.display = 'none', 150));
    }

    // Filter the list.
    search(query) {

        // Remove all underscores from the list.
        let list = abilities.map(e => e.replace(/_/g, ' '));

        // Filter the list.
        list = query ? list.filter(e => e.toLowerCase().startsWith(query.toLowerCase())) : list;

        // Convert string to HTML.
        const result = [];
        list.map(e => result.push(`<div onclick="update('${this.id}', '${e}')" title="${e}">${e}</div>`));

        // Return list.
        return result.length ?  result.join('') : '<div>No results</div>';
    }
}

// Load saved keybinds from cache.
keycache.map(a => a.key.length > 0 ? a.key.map(k => copy(a.ability.replace(/_/g, ' '), k)) : void 0);
if (keycache.length) toggle();

// Make a new keybind field.
function copy(ability, key) {

    // Declare varibales.
    const [id, btns] = [randomID(5, 5), document.querySelector('div[manage]')];

    // Update preset element string values.
    const field = keybinds.replace(/ID/g, id).replace(/ABILITY/g, ability || '').replace(/KEYBIND/g, key || '');

    // Remove buttons.
    btns.parentNode.removeChild(btns);

    // Add new element and buttons.
    document.querySelector('div[keys]').insertAdjacentHTML('beforeend', field + buttons);

    // Setup dropdown and keybind actions for new element.
    new Dropdown(document.getElementById(id));
    new Keybind(document.getElementById(id).querySelector('input[key]'));
}

// Save keybinds to file.
function save() {
    // Declare variables.
    let failed = false;
    const [keys, binds] = [document.querySelectorAll('div[keys] > div[id]'), []];

    // Fetch values from HTML.
    keys.forEach(e => {
        const [ability, key] = [e.querySelector('div[ability] input').value.replace(/ /g, '_'), e.querySelector('input[key]').value];
        if (!key || !ability || !abilities.includes(ability)) {
            failed = true;
            if (!key) e.querySelector('input[key]').classList.add('error');
            if (!ability || !abilities.includes(ability)) e.querySelector('div[ability] input').classList.add('error');
            return notify('Missing or improper keybinds.', true)
        }
        binds.push({ ability, key });
    });
    if (failed) return;

    // Send data to backend.
    ipcRenderer.request({ query: 'binds', binds });

    // Send a notification to the user.
    !saveToggle ? notify('Keybinds updated successfully!') : void 0;

    // Set save button background.
    !saveToggle ? toggle() : void 0;
}

function notify(msg, failed) {  
    const id = randomID(5, 5);
    let [notification, parent] = [document.createElement('div'), document.querySelector('div[notify]')]

    // Notification properties.
    if (failed) notification.classList.add('failed')
    notification.id = id
    notification.innerHTML = `<div onclick="removeNotif('${id}')">x</div>${msg}`
    parent.insertBefore(notification, parent.childNodes[0])

    // Notification timeout case.
    setTimeout(_ => {
        if (!notification.classList.contains('deleted')) notification?.classList?.add('deleted')
        setTimeout(_ => notification.parentNode.removeChild(notification), 490)
    }, 4000)
}

const removeNotif = id => document.getElementById(id)?.classList?.add('deleted');