class Dropdown {
    constructor(parent, list, initial) {
        this.modifiers = ['Shift', 'Control', 'Ctrl', 'Command', 'Cmd', 'Alt', 'Super'];
        this.list = list
        this.id = parent.id
        this.parent = parent
        this.input = parent.querySelector('input')
        this.dropdown = parent.querySelector('div[dropdown]')
        this.init(initial)
    }

    init(initial) {
        if (!initial) this.#resetDropdown()

        

        this.input.addEventListener('input', event => {
            if (this.id !== 'selection') saveToggle ? toggle() : void 0;
            this.dropdown.innerHTML = !this.modifiers.includes(event.key) ? this.search(this.input.value) : this.dropdown.innerHTML;
        })

        this.input.addEventListener('focus', _ => {
            this.#resetDropdown()
            this.input.select();
            this.parent.parentNode.classList.add('active')
            this.parent.classList.contains('error') ? this.parent.classList.remove('error') : void 0;
        })

        this.input.addEventListener('blur', _ => {
            this.parent.parentNode.classList.contains('active') ? this.parent.parentNode.classList.remove('active') : void 0
            setTimeout(_ => this.dropdown.classList.add('fade'), 100)
            setTimeout(_ => {
                this.dropdown.style.display = 'none'
                if (this.id === 'selection') {
                    const index = this.list.map(word => word.toLowerCase()).indexOf(this.input.value.toLowerCase())
                    if (index === -1) this.parent.classList.add('error')
                    else {
                        this.input.value = this.list[index]
                        request('confListener', { id: this.input.id, value: this.input.value })
                    }
                }
            }, 200)
        });
    }

    search(query) {
        const filtered = query ? this.list.filter(word => word.toLowerCase().includes(query.toLowerCase())) : this.list
        return filtered.length ? filtered.map(e => `<div onclick="update('${this.id}', '${e}')" title="${e}">${e}</div>`).join('') : '<div>No results</div>';
    }

    #resetDropdown() {
        this.dropdown.classList.contains('fade') ? this.dropdown.classList.remove('fade') : void 0;
        this.dropdown.style.display = 'block';
        this.dropdown.innerHTML = this.search()
        this.dropdown.scrollTop = 0
    }
}