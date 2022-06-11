// Import dependencies.
const { ipcRenderer } = require('electron');

// Frontend to backend communication.
ipcRenderer.request = query => ipcRenderer.sendSync('keybinds', query);

// Request data from backend.
let [keycache, abilities, bars] = ['keycache', 'abilities', 'bars'].map(query => ipcRenderer.request({ query }));

bars.unshift('Global');

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
    Numpad0: '0',
    Numpad1: '1',
    Numpad2: '2',
    Numpad3: '3',
    Numpad4: '4',
    Numpad5: '5',
    Numpad6: '6',
    Numpad7: '7',
    Numpad8: '8',
    Numpad9: '9',
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
    '<div id="ID"><div onclick="remove(\'ID\')" style="background:#F04747" remove>-</div><div ability id="Ability"><input type="text" placeholder="Ability" value="ABILITY" /><div dropdown></div></div><div keybinds id="Keybind"><input type="text" placeholder="Keybind" value="KEYBIND" key /></div><div bars id="Bar Name"><input type="text" placeholder="Bar Name" value="BARNAME" /><div barselect></div></div></div>',
    '<div manage><div onclick="copy()" style="background:#00A9FF" button>+ New Bind</div><div onclick="save()" button save>Save</div></div>'
];
let saveToggle = false;

// Random ID generator.
const randomID = (sections, phrase, join, random = a => a[Math.floor(Math.random() * a.length)]) => [...Array(sections)].map(_ => [...Array(phrase)].map(_ => random([...[...Array(26)].map((_, i) => String.fromCharCode(i + 65)), ...[...Array(26)].map((_, i) => String.fromCharCode(i + 65).toLowerCase()), ...[...Array(10).keys()]])).join('')).join(join ?? '-')

// Update input box value from dropdown selection.
const update = (id, ability, input = document.getElementById(id).querySelector('div[ability] input')) => {
    input.value = ability;
    saveToggle ? toggle() : void 0;
}
const updateBar = (id, ability) => {
    document.getElementById(id).querySelector('div[bars] input').value = ability;
    sendBars()
    saveToggle ? toggle() : void 0;
};

// Action for remove button.
const remove = (id, div = document.getElementById(id)) => {
    div.parentNode.removeChild(div);

    sendBars();

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
            this.input.parentNode.classList.contains('error') ? this.input.parentNode.classList.remove('error') : void 0;
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
class Ability {
    constructor(div, fromConfig) {
        this.fromConfig = fromConfig || false;
        this.div = div;
        this.id = div.id;
        this.input = div.querySelector('div[ability] input');
        this.dropdown = div.querySelector('div[dropdown]');
        this.dropdown.innerHTML = this.search();
        this.init();
    }

    // Initialize dropdown listener.
    init() {
        if (!this.fromConfig) this.input.focus()
        // When input is received from the input box, check if it is a valid character and then filter the list.
        this.input.addEventListener( 'input', e => {
            if ( !this.fromConfig ) this.dropdown.style.display = 'block';
            !modifiers.includes(e.key) ? this.dropdown.innerHTML = this.search(this.input.value) : void 0;

            // Update save button.
            saveToggle ? toggle() : void 0;
        });

        // Show dropdown when input box is clicked.
        this.input.addEventListener('focus', _ => {
            this.dropdown.style.display = 'block';
            this.input.select()
            this.input.parentNode.classList.contains('error') ? this.input.parentNode.classList.remove('error') : void 0;
        });

        // Hide dropdown when input box focus is lost.
        this.input.addEventListener('blur', _ => setTimeout(_ => this.dropdown.style.display = 'none', 150));
    }

    // Filter the list.
    search(query) {

        // Remove all underscores from the list.
        let list = abilities.map(e => e.replace(/_/g, ' ')).sort();

        // Filter the list.
        list = query ? list.filter(e => e.toLowerCase().includes(query.toLowerCase())) : list;

        // Convert string to HTML.
        const result = [];
        list.map(e => result.push(`<div onclick="update('${this.id}', '${e}')" title="${e}">${e}</div>`));

        // Return list.
        return result.length ? result.join('') : '<div>No results</div>';
    }
}


class Bar {
    constructor(div) {
        this.id = div.id;
        this.input = div.querySelector('div[bars] input');
        this.dropdown = div.querySelector('div[barselect]');
        this.dropdown.innerHTML = this.search();
        this.init();
    }

    // Initialize dropdown listener.
    init() {
        // When input is received from the input box, check if it is a valid character and then filter the list.
        this.input.addEventListener('input', e => {
            !modifiers.includes(e.key) ? this.dropdown.innerHTML = this.search(this.input.value) : void 0;

            sendBars()

            // Update save button.
            saveToggle ? toggle() : void 0;
        });

        // Show dropdown when input box is clicked.
        this.input.addEventListener('focus', _ => {
            this.dropdown.style.display = 'block';
            this.input.select()
            this.input.parentNode.classList.contains('error') ? this.input.parentNode.classList.remove('error') : void 0;
            this.dropdown.innerHTML = this.search();
        });

        // Hide dropdown when input box focus is lost.
        this.input.addEventListener('blur', _ => setTimeout(_ => this.dropdown.style.display = 'none', 150));
    }

    // Filter the list.
    search(query) {

        // Remove all underscores from the list.
        let list = bars.map( e => e.replace( /_/g, ' ' ) ).sort();

        // Filter the list.
        list = query ? list.filter(e => e.toLowerCase().includes(query.toLowerCase())) : list;

        // Convert string to HTML.
        const result = [];
        list.map(e => result.push(`<div onclick="updateBar('${this.id}', '${e}')" title="${e}">${e}</div>`));

        // Return list.
        return result.length ? result.join('') : '<div>No results</div>';
    }
}

// Load saved keybinds from cache.
keycache.map(a => a.key.length > 0 ? a.key.map(k => copy(a.name.replace(/_/g, ' '), k, a.bar, true)) : void 0);
if (keycache.length) toggle();

// Make a new keybind field.
function copy(ability, key, bar, initial) {

    // Declare varibales.
    const [id, btns] = [randomID(5, 5), document.querySelector('div[manage]')];

    // Update preset element string values.
    let field = keybinds.replace(/ID/g, id).replace(/ABILITY/g, ability || '').replace(/KEYBIND/g, key || '');
    for (let name of bars) if (name.toLowerCase() === (bar || 'Global').toLowerCase()) field = field.replace(/BARNAME/g, name)
    if (field.includes('BARNAME')) field = field.replace(/BARNAME/g, 'Global');

    // Remove buttons.
    btns.parentNode.removeChild(btns);

    // Add new element and buttons.
    document.querySelector('div[keys]').insertAdjacentHTML('beforeend', field + buttons);

    // Setup dropdown and keybind actions for new element.
    new Ability( document.getElementById( id ), initial);
    new Keybind(document.getElementById(id).querySelector('input[key]'));
    new Bar(document.getElementById(id));
    sendBars();

    if (!initial) window.scrollTo(0, document.body.scrollHeight);
}

// Save keybinds to file.
function save() {
    // Declare variables.
    let failed = false;
    const [keys, binds] = [document.querySelectorAll('div[keys] > div[id]'), []];

    // Fetch values from HTML.
    keys.forEach(e => {
        const [ability, key, bar] = [e.querySelector('div[ability] input').value, e.querySelector('input[key]').value, e.querySelector('div[bars] input').value];
        if (!key || !ability || !bar || !abilities.map(e => e.toLowerCase()).includes(ability.toLowerCase()) || !bars.map(e => e.toLowerCase()).includes(bar.toLowerCase())) {
            failed = true;
            if (!key) e.querySelector('div[keybinds]').classList.add('error');
            if (!ability || !abilities.map(e => e.toLowerCase()).includes(ability.toLowerCase())) e.querySelector('div[ability]').classList.add('error');
            if (!bar || !bars.map(e => e.toLowerCase()).includes(bar.toLowerCase())) e.querySelector('div[bars]').classList.add('error');
            return notify('Missing or improper keybinds.', true)
        }
        binds.push({ name: ability.replace(/ /g, '_'), key, bar });
    });
    if (failed) return;

    // Send data to backend.
    ipcRenderer.request({ query: 'binds', binds });

    // Send a notification to the user.
    !saveToggle ? notify('Keybinds updated successfully!') : void 0;

    // Set save button background.
    !saveToggle ? toggle() : void 0;
}

// Notification triggers.
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

// Remove notification.
const removeNotif = id => document.getElementById(id)?.classList?.add('deleted');

// Send keybinds to bars window.
function sendBars() {
    const [bars, data] = [document.querySelectorAll('div[bars] input'), []];
    bars.forEach(bar => data.push(bar.value.toLowerCase()));
    ipcRenderer.sendSync('passToBars', data);
}

// Incoming data events.
ipcRenderer.on('passToKeys', (event, args) => bars = [...new Set(['Global', ...args.filter(e => e)])])
ipcRenderer.on('updateKeys', (event, arg) => {
    const bars = document.querySelectorAll('div[bars]')

    // Remove keybind if it is linked to deleted bar.
    bars.forEach(bar => {
        if (arg === bar.querySelector('input').value.toLowerCase()) {
            bar.parentNode.parentNode.removeChild(bar.parentNode)
        }
    })
    // Set save button background.
    !saveToggle ? toggle() : void 0;
})
