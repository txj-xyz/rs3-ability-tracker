// Import dependencies.
const [Manager, { uIOhook, UiohookKey }, activeWindows] = ['../base/Manager.js', 'uiohook-napi', 'electron-active-window'].map(require);

// Function to get frontend page paths.
module.exports = class Trigger extends Manager {

    lastKey = {
        value: null,
        timestamp: 0
    }
    keyCheck = []
    activeBar = null

    constructor() {
        super()
        this.initListeners();
    }

    initListeners() {
        unregister()
        uIOhook.on('keydown', event => {
            if (!this.rs3Instance()) return
            const hash = this.hashEvent(event);
            if (!this.keyCheck[event.keycode]) this.keyCheck[event.keycode] = new Map();
            if (!this.keyCheck[event.keycode].get(hash)) this.handleKeyPress(event);
            this.keyCheck[event.keycode].set(hash, true);
        });

        // Listen to keyup.
        uIOhook.on('keyup', event => {
            if (!this.rs3Instance() || !this.keyCheck[event.keycode]) return;
            this.keyCheck[event.keycode].clear();
        });
    }

    hashEvent(ev) {
        return this.getKeyName('a', ev.altKey) + this.getKeyName('c', ev.ctrlKey) + this.getKeyName('m', ev.metaKey) + this.getKeyName('s', ev.shiftKey) + ev.keycode;
    }

    rs3Instance() {
        if (__devMode) return true;
        activeWindows().getActiveWindow().then(activeWin => {
            return activeWin.windowName.match(/(rs2client|RuneScape)/g)?.[0] ? true : false
        });
    }

    getKeyName(name, val) {
        return val ? name : '';
    }

    handleKeyPress(trigger) {
        for (const set of config.referenceStorage.keybinds) {

            // For every keybind.
            for (const key of set.keybind) {
                // Get modifier keys.
                const modifier = key.split('+').map(e => e.trim());

                // Get letter.
                const letter = modifier.pop();
                let failed = false;

                const modifierKeyMap = { Shift: 'shiftKey', Ctrl: 'ctrlKey', Alt: 'altKey', Super: 'metaKey' };

                // check if modifiers are pressed
                for (const key of Object.keys(modifierKeyMap)) {
                    if (modifier.includes(key) && !trigger[modifierKeyMap[key]]) failed = true;
                    if (!modifier.includes(key) && trigger[modifierKeyMap[key]]) failed = true;
                }

                // Combat loop found keybind
                if ((UiohookKey[letter] === trigger.keycode || keycodes.data[letter] === trigger.keycode) && !failed) {
                    let reference = library.get(set.name)

                    // set timestamp for successfull keybind press
                    if (config.toggleSwitching && reference.type === 'slot-icons' && set.bar.toLowerCase() !== this.activeBar?.toLowerCase()) this.activeBar = set.bar;

                    if (set.bar.toLowerCase() === (config.toggleSwitching ? this.activeBar : config.barsSelection)?.toLowerCase()) {
                        windows.ability?.webContents.send('abilityData', { icon: library.get(set.name).icon, perk: set.perk ? library.get(set.perk).icon : null });
                    }
                }
            }
        }
    }
};
