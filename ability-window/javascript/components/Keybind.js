class Keybind {
    constructor(input) {
        let list = input.value.split('+').map(e => e.trim());
        this.modifiers = ['Shift', 'Control', 'Ctrl', 'Command', 'Cmd', 'Alt', 'Super'];
        this.key = list.pop() ?? null;
        this.modify = list[0] ?? null;
        this.input = input;
        this.init();
    }

    // Initialize keybind listener.
    init() {
        this.input.addEventListener('focus', _ => {
            this.input.parentNode.classList.contains('error') ? this.input.parentNode.classList.remove('error') : void 0;
            this.input.setAttribute('placeholder', 'Listening...');
        });
        this.input.addEventListener('blur', _ => {
            this.input.setAttribute('placeholder', 'Keybind')
            if (this.modify && !this.key && !this.input.hasAttribute('search')) {
                this.input.parentNode.classList.add('error');
                this.input.parentNode.setAttribute('error', 'Invalid keybind');
            }
        });
        this.input.addEventListener('keydown', e => {
            // Prevent default action.
            e.preventDefault();

            // If backspace is pressed, remove from list.
            if (keycodes[e.code || e.key] === 'Backspace') {
                this.key ? this.key = '' : this.modify = '';
                this.input.value = `${this.modify ?? ''}${this.modify ? ' + ' : ''}${this.key}`;
                this.input.hasAttribute('search') ? toggleClear() : void 0;
                return
            }
            if (!keycodes[e.code || e.key]) return
            // Check if modifier is pressed.
            else if (this.modifiers.includes(keycodes[e.code || e.key]) && this.modify !== keycodes[e.code || e.key]) this.modify = keycodes[e.code || e.key];
            // Check if key is pressed.
            else if (this.modify !== keycodes[e.code || e.key]) this.key = keycodes[e.code || e.key];

            // Update frontend.
            this.input.value = `${this.modify ?? ''}${this.modify ? ' + ' : ''}${this.key}`;


            // Update save button.
            if (this.input.hasAttribute('search')) {
                toggleClear(true);
                document.querySelectorAll(`div[keys] > div[id]:not([search])`).forEach(element => {
                    const query = element.querySelector(`div[${toggles.search}] input`)
                    if (query.value !== this.input.value) query.parentNode.parentNode.classList.add('hide')
                    else query.parentNode.parentNode.classList.contains('hide') ? query.parentNode.parentNode.classList.remove('hide') : void 0;
                })
            } else {
                toggles.save ? toggle() : void 0;
                toggles.order ? toggleOrder() : void 0;
            }
        });
    }
}