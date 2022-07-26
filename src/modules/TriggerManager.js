const { windows } = require( "../base/Manager" );

// Import dependencies.
const [Manager, { uIOhook }, activeWindow] = ['../base/Manager.js', 'uiohook-napi', 'active-win'].map(require);

// Function to get frontend page paths.
module.exports = class Trigger extends Manager {
    lastKey = {
        style: null,
        value: null,
        timestamp: 0,
    };
    keyCheck = [];
    activeBar = config.barsSelection;
    keybinds = null;

    constructor() {
        super();
        this.initListeners();
    }

    initListeners() {
        unregister();
        uIOhook.on('keydown', async event => {
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
            for (const keybind of possibleKeys) {
                let binds = config.referenceStorage.keybinds.filter(e => e.keybind === keybind);
                let globals = binds.filter(e => e.bar === 'Global');
                binds = binds.filter(e => e.bar !== 'Global');
                globals.map(e => binds.push(e));

                for (const bind of binds) {
                    if (!success) {
                        // anti-spam
                        if (bind.name === this.lastKey.value && Date.now() - this.lastKey.timestamp < rsOptions.spamCooldown) return;
                        const reference = library.get(bind.name);
                        // console.log('style check', reference)

                        if(reference?.style && reference.icon.match(/(weapons\/(magic|melee|range)|slot-icons)/g)) {
                            console.log('pushed style:', reference.style)
                            console.log('last style:', this.lastKey.style) 
                            console.log('------------------')
                        } else {
                            console.log('ability style:', reference.style)
                            console.log('match last push?:', reference.style === this.lastKey.style)
                        }

                        //swap bar if triggered bind is not on the same bar
                        if (config.toggleSwitching && reference.icon.match(/(weapons\/(magic|melee|range)|slot-icons)/g) && bind.bar.toLowerCase() !== this.activeBar?.toLowerCase()) {
                            this.activeBar = bind.bar;
                        }

                        if ([this.activeBar, 'Global'].includes(bind.bar)) {
                            success = true;
                            this.lastKey.value = bind.name;
                            this.lastKey.style = reference?.style ?? null,
                            this.lastKey.timestamp = Date.now();
                            windows.ability?.webContents.send('abilityData', { icon: reference.customIcon ?? reference.icon, perk: bind.perk ? library.get(bind.perk).icon : null });
                        }
                    }
                }
            }

            // Handle bar switching here directly.
            for(const key of possibleKeys){
                // Change bar logic
                let _bind = config.referenceStorage.bars.find(bar => bar.key === key);
                if(_bind && _bind?.name && !config.toggleSwitching) {
                    this.activeBar = _bind.name
                    windows.main?.webContents.send('fromTrigger', this.activeBar)
                }
            }

        } catch (error) {
            console.log(error);
        }
    }
};
