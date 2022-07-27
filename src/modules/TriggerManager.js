const { windows } = require('../base/Manager');

// Import dependencies.
const [Manager, { uIOhook }, activeWindow] = ['../base/Manager.js', 'uiohook-napi', 'active-win'].map(require);

// Function to get frontend page paths.
module.exports = class Trigger extends Manager {
    lastKey = {
        style: null,
        value: null,
        timestamp: 0,
    };
    currentWeapon = {
        name: null,
        style: null,
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

    checkRSSwitches({ _falsePositive, bind, _isAbility, reference, _isWeapon, _abilityType }) {
        let passed = [];
        passed.push(!_falsePositive)
        passed.push([this.activeBar, 'Global'].includes(bind.bar))
        passed.push((_isAbility && this.currentWeapon.style === reference.style) || (_isAbility && bind.bar === 'Global') || _isWeapon || !reference?.style)
        passed.push((passed[2] && _isAbility ? _abilityType === this.currentWeapon.type : true ))

        __devMode && console.log('passed check?', !passed.includes(false))
        __devMode && console.log('passed array', passed)
        __devMode && console.log('ability type:', _abilityType)
        __devMode && console.log('current weapon', this.currentWeapon)
        __devMode && console.log('------------------------------')
        return !passed.includes(false)
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
                    let _falsePositive = false;
                    if (!success) {
                        // anti-spam
                        if (bind.name === this.lastKey.value && Date.now() - this.lastKey.timestamp < rsOptions.spamCooldown) return;

                        // GRAB BIND INFORMATION
                        const reference = library.get(bind.name);
                        const _abilityType = reference.icon.match(/((?<=abilities\/)(magic|melee|range)|slot-icons)/g)?.[0] ?? null;
                        const _isWeapon = reference.icon.match(/(weapons\/(magic|melee|range)|slot-icons)/g) ?? null;
                        // const _isArmor = reference.icon.match(/(armor\/(magic|melee|range)|slot-icons)/g);
                        const _isAbility = !_isWeapon;

                        // SWITCHSCAPE ???
                        if (reference.style && _isWeapon) {
                            this.currentWeapon.style = reference.style ?? null;
                            this.currentWeapon.name = bind.name ?? null;
                            this.currentWeapon.type = reference.icon.match(/((?<=weapons\/)(magic|melee|range)|slot-icons)/g)?.[0] ?? null;
                        }

                        // If no weapon pushed, then only show Global stuff
                        if (!this.lastKey.value && _isAbility ? bind.bar !== 'Global' : void 0) _falsePositive = true;

                        // swap active bar if toggleSwitching is enabled
                        // if (config.toggleSwitching && reference.icon.match(/(weapons\/(magic|melee|range)|slot-icons)/g) && bind.bar.toLowerCase() !== this.activeBar?.toLowerCase()) {
                        //     this.activeBar = bind.bar;
                        // }

                        if (config.toggleSwitching ? this.checkRSSwitches({ _falsePositive, bind, _isAbility, reference, _isWeapon, _abilityType }) : [this.activeBar, 'Global'].includes(bind.bar) ) {
                            success = true;
                            this.lastKey.value = bind.name;
                            this.lastKey.timestamp = Date.now();
                            windows.ability?.webContents.send('abilityData', { icon: reference.customIcon ?? reference.icon, perk: bind.perk ? library.get(bind.perk).icon : null });
                        }
                    }
                }
            }

            // Handle bar switching here directly for bar keybinds.
            for (const key of possibleKeys) {
                let _bind = config.referenceStorage.bars.find(bar => bar.key === key);
                if (_bind && _bind?.name && !config.toggleSwitching) {
                    this.activeBar = _bind.name;
                    windows.main?.webContents.send('fromTrigger', this.activeBar);
                }
            }


        } catch (error) {
            console.log(error);
        }
    }
};
