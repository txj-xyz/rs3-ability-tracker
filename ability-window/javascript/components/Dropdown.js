class Dropdown {
    constructor(parent, list, initial, callback) {
        this.modifiers = ['Shift', 'Control', 'Ctrl', 'Command', 'Cmd', 'Alt', 'Super'];
        this.list = list
        this.id = parent.id
        this.parent = parent
        this.input = parent.querySelector('input')
        this.dropdown = parent.querySelector('div[dropdown]')
        this.init(initial, callback)
    }

    init(initial, callback) {
        if (initial && this.id === 'barsSelection') this.input.value = config.barsSelection
        this.dropdown.innerHTML = this.search()

        this.input.addEventListener('input', event => {
            if (!initial) this.#resetDropdown()
            this.dropdown.innerHTML = !this.modifiers.includes(event.key) ? this.search(this.input.value) : this.dropdown.innerHTML;
            saveToggle ? toggle() : void 0;
        })

        this.input.addEventListener('focus', _ => {
            this.#resetDropdown()
            this.input.select();
            this.parent.classList.contains('error') ? this.parent.classList.remove('error') : void 0;
        })

        this.input.addEventListener('blur', _ => {
            setTimeout(_ => this.dropdown.classList.add('fade'), 100)
            setTimeout(_ => this.dropdown.style.display = 'none', 200)
        });
    }

    search(query) {
        const filtered = query ? this.list.filter(word => word.toLowerCase().includes(query.toLowerCase())) : this.list
        return filtered.length ? filtered.map(e => `<div onclick="update('${this.id}', '${e}')" title="${e}">${e}</div>`).join('') : '<div>No results</div>';
    }

    #resetDropdown() {
        this.dropdown.classList.contains('fade') ? this.dropdown.classList.remove('fade') : void 0;
        this.dropdown.style.display = 'block';
    }
}