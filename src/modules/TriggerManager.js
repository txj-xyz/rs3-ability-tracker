// Import dependencies.
const [Manager, { uIOhook }, activeWindow] = ['../base/Manager.js', 'uiohook-napi', 'active-win'].map(require);

// Function to get frontend page paths.
module.exports = class Trigger extends Manager {
    lastKey = {
        value: null,
        timestamp: 0,
    };
    keyCheck = [];
    pauseOnChatbox = false;
    activeBar = config.barsSelection;
    spamCooldown = 2000;
    keybinds = null;

    constructor() {
        super();
        this.initListeners();
    }

    initListeners() {
        unregister();
        uIOhook.on('keydown', async event => {
            // if (!await this.rs3Instance()) return;
            activeWindow({ screenRecordingPermission: false }).then(result => {
                if (__devMode || result.owner.name.match(/(rs2client|RuneScape)/g)) {
                    const hash = this.hashEvent(event);
                    if (!this.keyCheck[event.keycode]) this.keyCheck[event.keycode] = new Map();
                    if (!this.keyCheck[event.keycode].get(hash)) this.handleKeyPress(event);
                    this.keyCheck[event.keycode].set(hash, true);
                }
            });
        });

        // Listen to keyup.
        uIOhook.on('keyup', event => {
            if (!this.keyCheck[event.keycode]) return;
            this.keyCheck[event.keycode].clear();
        });
    }

    hashEvent(ev) {
        return this.getKeyName('a', ev.altKey) + this.getKeyName('c', ev.ctrlKey) + this.getKeyName('m', ev.metaKey) + this.getKeyName('s', ev.shiftKey) + ev.keycode;
    }

    // async rs3Instance() {
    //     // if (__devMode || (__platform === 'darwin' && process.arch === 'arm64')) return true;
    //     if (__devMode) return true;
    //     const window = await activeWindow()
    //     // console.log(window.owner.name.match(/(rs2client|RuneScape)/g) ? true : false)
    //     let instance = window.owner.name.match(/(rs2client|RuneScape)/g)?.[0] ? true : false;
    //     // console.log(instance)
    //     return instance
    // }

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
            //prettier-ignore
            if (Object.keys(modifiers).map(k => modifiers[k]).includes(key)) return
            const possibleKeys = pressedModifiers.some(e => e) ? pressedModifiers.map(mod => `${modifiers[mod]} + ${key}`) : [key];

            key.toLowerCase() === 'enter' ? this.pauseOnChatbox = !this.pauseOnChatbox : void 0;
            if(key.toLowerCase() === 'escape' && this.pauseOnChatbox) this.pauseOnChatbox = !this.pauseOnChatbox

            if (this.pauseOnChatbox === false) {
                for (const keybind of possibleKeys) {
                    let binds = config.referenceStorage.keybinds.filter(e => e.keybind === keybind);
                    let globals = binds.filter(e => e.bar === 'Global');
                    binds = binds.filter(e => e.bar !== 'Global');
                    globals.map(e => binds.push(e));
                    for (const bind of binds) {
                        if (!success) {
                            if (bind.name === this.lastKey.value && Date.now() - this.lastKey.timestamp < this.spamCooldown) return;
                            const reference = library.get(bind.name);
                            //swap bar if triggered bind is not on the same bar
                            if (config.toggleSwitching && reference.icon.match(/(weapons\/(magic|melee|range)|slot-icons)/g) && bind.bar.toLowerCase() !== this.activeBar?.toLowerCase()) {
                                this.activeBar = bind.bar;
                            }
    
                            if ([this.activeBar, 'Global'].includes(bind.bar)) {
                                success = true;
                                this.lastKey.value = bind.name;
                                this.lastKey.timestamp = Date.now();
                                windows.ability?.webContents.send('abilityData', { icon: reference.customIcon ?? reference.icon, perk: bind.perk ? library.get(bind.perk).icon : null });
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
};
