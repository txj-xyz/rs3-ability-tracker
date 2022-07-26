class Dropdown {
    constructor(parent, list, initial, id) {
        this.modifiers = ['Shift', 'Control', 'Ctrl', 'Command', 'Cmd', 'Alt', 'Super'];
        this.list = list
        this.id = parent ? parent.id : null
        this.query = id
        this.parent = parent
        this.input = parent.querySelector(id ? `div[${id}] input` : 'input')
        this.dropdown = parent.querySelector(`div[${id === 'bars' ? 'barselect' : 'dropdown'}]`)
        this.init(initial)
    }

    init(initial) {
        if (!initial) {
            this.#resetDropdown()
            if (this.query === 'name') {
                this.input.focus()
                this.input.style.borderRadius = '3px'
            }
            this.dropdown.style.display = 'none';
        }

        this.input.onclick = _ => {
            if (this.dropdown.style.display === 'none') {
                this.dropdown.style.display = 'block';
                this.#resetDropdown()
                this.input.style.borderRadius = '3px 3px 0 0';
            }
        }

        document.addEventListener('keydown', event => {
            if (this.dropdown && this.dropdown.style.display === 'block' && ['Enter', 'Tab'].includes(event.key)) {
                event.preventDefault()
                update(this.id, this.dropdown.querySelector('div').textContent, this.query)
            }
        });

        this.input.addEventListener('input', event => {
            this.dropdown.style.display = 'block';
            if (this.id !== 'selection' && !this.parent.hasAttribute('search') && toggles.save) {
                toggle()
                toggleOrder()
            }
            this.dropdown.innerHTML = !this.modifiers.includes(event.key) ? this.search(this.input.value) : this.dropdown.innerHTML;
            if (this.parent.hasAttribute('search')) {
                toggleClear(true)
                document.querySelectorAll(`div[keys] > div[id]:not([search])`).forEach(element => {
                    const query = element.querySelector(`div[${toggles.search}] input`)
                    if (!query.value.toLowerCase().includes(this.input.value.toLowerCase())) query.parentNode.parentNode.classList.add('hide')
                    else query.parentNode.parentNode.classList.contains('hide') ? query.parentNode.parentNode.classList.remove('hide') : void 0;
                })
            }
            if (this.input.id !== 'barsSelection') toggleImage(this.id, this.query === 'name' && this.list.find(word => word.toLowerCase() === this.input.value.toLowerCase()))
        })

        this.input.addEventListener('focus', _ => {
            this.#resetDropdown()
            this.dropdown.style.display = 'block';
            this.input.select();
            this.parent.hasAttribute('search') ? this.input.style.borderRadius = '3px 3px 0 0 !important' : void 0;
            this.query ? this.parent.querySelector(`div[${this.query}]`).classList.add('active') : this.parent.parentNode.classList.add('active')
            this.parent.classList.contains('error') ? this.parent.classList.remove('error') : void 0;
            this.input.parentNode.classList.contains('error') ? this.input.parentNode.classList.remove('error') : void 0;

            if (this.query === 'name' && this.input.value) this.dropdown.querySelector(`div[title="${this.input.value}"]`).scrollIntoView()
        })

        this.input.addEventListener('blur', _ => {
            this.parent.hasAttribute('search') ? this.input.style.borderRadius = '3px' : void 0;
            this.query ? (this.parent.querySelector(`div[${this.query}]`).classList.contains('active') ? this.parent.querySelector(`div[${this.query}]`).classList.remove('active') : void 0) : (this.parent.parentNode.classList.contains('active') ? this.parent.parentNode.classList.remove('active') : void 0)
            setTimeout(_ => this.dropdown.classList.add('fade'), 150)
            setTimeout(_ => {
                this.dropdown.style.display = 'none'
                const index = this.list.map(word => word?.name ? word.name.toLowerCase() : word.toLowerCase()).indexOf(this.input.value.toLowerCase())
                if (index === -1) {
                    if (this.input.value && !this.parent.hasAttribute('search')) {
                        if (this.query) {
                            this.input.parentNode.classList.add('error')
                            this.input.parentNode.setAttribute('error', 'Invalid selection')
                        } else {
                            this.parent.classList.add('error')
                            this.parent.setAttribute('error', 'Invalid selection')
                        }
                    }
                }
                else {
                    this.input.value = this.list[index]
                    title === 'main' ? request('confListener', { id: this.input.id, value: this.input.value }) : void 0;
                }
            }, 300)
        });
    }

    search(query) {
        const filtered = query ? this.list.filter(word => word.toLowerCase().includes(query.toLowerCase())).sort() : this.list.sort()
        return filtered.length ? filtered.map(e => `<div onclick="update('${this.id}', '${e}', '${this.query}')" title="${e}">${this.query === 'name' || this.parent.hasAttribute('search') ? `${getImg(e)}<p>${e}</p>` : e}</div>`).join('') : '<div>No results</div>';
    }

    #resetDropdown() {
        this.dropdown.classList.contains('fade') ? this.dropdown.classList.remove('fade') : void 0;
        this.dropdown.innerHTML = this.search();
        this.dropdown.scrollTop = 0
    }
}