const { ipcRenderer } = require('electron')
ipcRenderer.request = query => ipcRenderer.sendSync('keybinds_request', query)
let keybindList = ipcRenderer.request({ query: 'keys' })
let abilities = ipcRenderer.request({ query: 'abilities' })
const modifiers = ['Shift', 'Control', 'Ctrl', 'Command', 'Cmd', 'Alt', 'AltGr', 'Super', 'Backspace']
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
}
const elemDefault = `
        <div id="ID">
            <div onclick="remove('ID')" remove>-</div>
            <div ability>
                <input type="text" placeholder="Ability" value="ABILITY" />
                <div dropdown></div>
            </div>
            <input type="text" placeholder="Keybind" value="KEYBIND" key />
        </div>`

class Keybind {
    constructor(input) {
        this.key
        this.modify = []
        this.input = input
        this.init()
    }

    init() {
        this.input.addEventListener('keydown', e => {
            e.preventDefault()
            if (keycodes[e.code || e.key] === 'Backspace') this.key ? this.key = null : this.modify.pop()
            else if (modifiers.includes(keycodes[e.code || e.key]) && this.modify.length < 2 && !this.modify.includes(keycodes[e.code || e.key])) this.modify.push(keycodes[e.code || e.key])
            else if (!this.modify.includes(keycodes[e.code || e.key])) this.key = keycodes[e.code || e.key]
            this.write()
        })
    }

    write() {
        let result = ''
        if (this.modify.length > 0) this.modify.map(e => result += e + ' + ')
        if (this.key) result += this.key
        this.input.value = result
    }
}

class Dropdown {
    constructor(div) {
        this.id = div.id
        this.input = div.querySelector('div[ability] input')
        this.dropdown = div.querySelector('div[dropdown]')
        this.dropdown.innerHTML = this.search()
        this.init()
    }

    init() {
        this.input.addEventListener('input', e => !modifiers.includes(e.key) ? this.dropdown.innerHTML = this.search(this.input.value) : void 0)
        this.input.addEventListener('focus', _ => this.dropdown.style.display = 'block')
        this.input.addEventListener('blur', _ => setTimeout(_ => this.dropdown.style.display = 'none', 200))
    }
    
    search(query) {
        let list = abilities.map(e => e.replace(/_/g, ' '))
        list = query ? list.filter(e => e.toLowerCase().startsWith(query.toLowerCase())) : list
        const result = []
        list.map(e => {
            result.push(`<div onclick="update('${this.id}', '${e}')">${e}</div>`)
        })
        return result.join('')
    }
}

function update(id, ability) {
    const input = document.getElementById(id).querySelector('div[ability] input')
    input.value = ability
}

keybindList.map(a => a.key.length > 0 ? a.key.map(k => copy(a.ability, k)) : void 0)

function copy(ability, key) {
    const addElem = '<div addition><div onclick="copy()" add>+ New Bind</div><div onclick="save()" add>Save</div></div>'
    const randomID = (sections, phrase, join, random = a => a[Math.floor(Math.random() * a.length)]) => [...Array(sections)].map(_ => [...Array(phrase)].map(_ => random([...[...Array(26)].map((_, i) => String.fromCharCode(i + 65)), ...[...Array(26)].map((_, i) => String.fromCharCode(i + 65).toLowerCase()), ...[...Array(10).keys()]])).join('')).join(join ?? '-')
    const id = randomID(5, 5)
    const field = elemDefault.replace(/ID/g, id).replace(/ABILITY/g, ability || '').replace(/KEYBIND/g, key || '')
    const add = document.querySelector('div[addition]')
    add.parentNode.removeChild(add)
    document.querySelector('div[keys]').insertAdjacentHTML('beforeend', field + addElem)
    new Dropdown(document.getElementById(id))
    new Keybind(document.getElementById(id).querySelector('input[key]'))
}

function remove(id) {
    const div = document.getElementById(id)
    div.parentNode.removeChild(div)
}

function save() {
    const keys = document.querySelectorAll('div[keys] > div[id]')
    const binds = []
    keys.forEach(e => {
        const ability = e.querySelector('div[ability] input').value.replace(/ /g, '_')
        const key = e.querySelector('input[key]').value
        binds.push({ ability, key })
    })
    ipcRenderer.request({ query: 'binds', binds })
    new Notification('Keybinds Updated!', { body: 'New keybinds have been successfully stored', timeoutType: 'default' })
}
