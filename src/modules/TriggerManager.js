// Import dependencies.
const [Manager, { uIOhook, UiohookKey }, activeWindows] = ['../base/Manager.js', 'uiohook-napi', 'electron-active-window'].map(require);

// Function to get frontend page paths.
module.exports = class Trigger extends Manager {
    lastKey = {
        value: null,
        timestamp: 0,
    };
    keyCheck = [];
    activeBar = config.barsSelection;
    spamCooldown = 2000;
    keybinds = null;

    constructor() {
        super();
        this.initListeners();
    }

    initListeners() {
        this.keybinds = new Map();
        config.referenceStorage.keybinds.map(bind => this.keybinds.set(bind.keybind, bind));

        unregister();
        uIOhook.on('keydown', event => {
            if (!this.rs3Instance()) return;
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
        activeWindows()
            .getActiveWindow()
            .then(activeWin => {
                return activeWin.windowName.match(/(rs2client|RuneScape)/g)?.[0] ? true : false;
            });
    }

    getKeyName(name, val) {
        return val ? name : '';
    }

    handleKeyPress(trigger) {
        let success = false;
        try {
            const modifiers = { shiftKey: 'Shift', ctrlKey: 'Ctrl', altKey: 'Alt', metaKey: 'Super' };
            const pressedModifiers = Object.keys(trigger)
                .map(prop => (prop.endsWith('Key') && trigger[prop] ? prop : null))
                .filter(e => e);
            const key = keycodes.reverseMap.get(trigger.keycode.toString());
            if (Object.keys(modifiers).map(k => modifiers[k]).includes(key)) return
            const possibleKeys = pressedModifiers.some(e => e) ? pressedModifiers.map(mod => `${modifiers[mod]} + ${key}`) : [key];

            for (const keybind of possibleKeys) {
                const bind = this.keybinds.get(keybind);
                if (bind && !success) {
                    success = true;
                    if (bind.name === this.lastKey.value && Date.now() - this.lastKey.timestamp < this.spamCooldown) return;
                    this.lastKey.value = bind.name;
                    this.lastKey.timestamp = Date.now();
                    const reference = library.get(bind.name);
                    if (config.toggleSwitching && reference.type === 'slot-icons' && bind.bar.toLowerCase() !== this.activeBar?.toLowerCase()) this.activeBar = bind.bar;
                    if (bind.bar.toLowerCase() === (config.toggleSwitching ? this.activeBar : config.barsSelection)?.toLowerCase()) {
                        windows.ability?.webContents.send('abilityData', { icon: reference.customIcon ?? reference.icon, perk: bind.perk ? library.get(bind.perk).icon : null });
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
};
