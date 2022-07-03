let { library, keycodes } = request('config', true)
const [toggles, element, actions] = [
    {
        save: false,
        order: {
            available: false,
            query: 'name',
        },
        clear: false,
        search: 'name',
        hidden: false,
        filter: [],
        popup: null
    },
    id => `<div id="${id}"><div remove>-</div><div name id="Ability / Item"><input type="text" placeholder="Ability / Item" /><div dropdown></div></div> <div keybinds id="Keybind"><input type="text" placeholder="Keybind" /> </div> <div bars id="Bar Name"><input type="text" placeholder="Bar Name" /><div barselect></div> </div> <div image>&#x1F5BC;&#xFE0F;</div></div>`,
    `<div manage><div onclick="copy()" button>+ New Bar</div><div onclick="save()" button save>Save</div></div>`
]

if (config.referenceStorage.keybinds.length) config.referenceStorage.keybinds.map(set => copy(true, set))
else document.querySelector('div[keys]').insertAdjacentHTML('beforeend', actions)

document.querySelector('div[filter] div[list]').innerHTML = `<div>${[...new Set(library.map(set => set.type.split('-').map(word => word.slice(0, 1).toUpperCase() + word.slice(1)).join(' ')))].join('</div><div>')}</div>`

function getImg(query) {
    const data = library.find(element => element.name === query)
    return data ? `<div style="background: url(${data.customIcon ?? data.icon.replace(/\(/g, '%28').replace(/\)/g, '%29')}); width: 10px; height: 10px;" abilityImg></div>` : ''
}

function copy(initial, data) {
    const [id, manage] = [random(), document.querySelector('div[manage]')]
    manage ? manage.remove() : void 0;
    document.querySelector('div[keys]').insertAdjacentHTML('beforeend', element(id));
    document.querySelector('div[keys]').insertAdjacentHTML('beforeend', actions);
    const component = document.getElementById(id);
    const name = component.querySelector('div[name] input')
    const keybind = component.querySelector('div[keybinds] input')
    const bar = component.querySelector('div[bars] input')
    let set = initial ? library.find(set => set.name === data.name) : null

    component.querySelector('div[remove]').onclick = _ => {
        component.remove()
        toggle()
        toggleOrder()
    }

    if (set && set.customIcon) {
        component.querySelector('div[image]').classList.add('active')
        document.querySelector('div[revertImage]').classList.contains('disable') ? document.querySelector('div[revertImage]').classList.remove('disable') : void 0
    } else document.querySelector('div[revertImage]').classList.add('disable')


    component.querySelector('div[image]').onclick = _ => {
        toggles.popup = id;
        const pickerMount = document.querySelector('div[pickerMount]')
        pickerMount.classList.contains('hide') ? pickerMount.classList.remove('hide') : void 0;
        set = library.find(set => set.name === name.value)
        if (set && set.customIcon) {
            component.querySelector('div[image]').classList.add('active')
            document.querySelector('div[revertImage]').classList.contains('disable') ? document.querySelector('div[revertImage]').classList.remove('disable') : void 0
        } else document.querySelector('div[revertImage]').classList.add('disable')
        document.documentElement.style.setProperty('--revertImg', `url(${set.icon})`);
        document.querySelector('div[imagePicker] div[image]').style.background = `url(${set.customIcon ?? set.icon})`
    }

    name.value = initial ? data.name : '';
    keybind.value = initial ? data.keybind : '';
    bar.value = initial ? data.bar : 'Global';

    if (!config.referenceStorage.bars.length) bar.parentNode.classList.add('disable')

    new Dropdown(component, library.map(set => set.name), initial, 'name')
    new Dropdown(component, ['Global', ...config.referenceStorage.bars], initial, 'bars')
    new Keybind(keybind)

    if (!initial) {
        window.scrollTo(0, document.body.scrollHeight);
        toggleOrder()
    } else toggle(true)
}

function toggle(value) {
    const save = document.querySelector('div[save]')
    toggles.save = value ? true : false;
    if (toggles.save) save.classList.add('active')
    else save.classList.contains('active') ? save.classList.remove('active') : void 0;
}

function toggleOrder(value) {
    const order = document.querySelector('div[order]')
    toggles.order.available = value ? true : false;
    if (toggles.order.available) {
        order.classList.add('active')
        const list = []
        document.querySelectorAll('div[keys] > div[id]:not([search])').forEach(element => {
            const name = element.querySelector('div[name] input');
            const keybind = element.querySelector('div[keybinds] input');
            const bar = element.querySelector('div[bars] input');
            list.push({ name: name.value, keybinds: keybind.value, bars: bar.value })
        })
        document.querySelectorAll('div[keys] > div[id]:not([search])').forEach(element => element.remove())
        list.sort((a, b) => a[toggles.order.query] > b[toggles.order.query] ? 1 : -1).map(set => copy(true, { name: set.name, keybind: set.keybinds, bar: set.bars }))
    }
    else order.classList.contains('active') ? order.classList.remove('active') : void 0;
}

function toggleClear(value) {
    const clear = document.querySelector('div[clear]')
    toggles.clear = value ? true : false;
    if (toggles.clear) clear.classList.add('active')
    else clear.classList.contains('active') ? clear.classList.remove('active') : void 0;
}

function update(id, value, query) {
    if (query === 'undefined') {
        document.querySelector('div[search] input').value = value;
        document.querySelectorAll(`div[keys] > div[id]:not([search])`).forEach(element => {
            const input = element.querySelector(`div[${toggles.search}] input`)
            if (!input.value.includes(value)) input.parentNode.parentNode.classList.add('hide')
            else input.parentNode.parentNode.classList.contains('hide') ? input.parentNode.parentNode.classList.remove('hide') : void 0;
        })
        return toggleClear(true)
    }
    document.getElementById(id).querySelector(`div[${query}] input`).value = value;
    toggles.save ? toggle() : void 0;
}

function save() {
    let failed = false;
    const binds = []
    if (document.querySelector('div.error')) return
    document.querySelectorAll('div[keys] > div[id]:not([search])').forEach(element => {
        const name = element.querySelector('div[name] input');
        const keybind = element.querySelector('div[keybinds] input');
        const bar = element.querySelector('div[bars] input');
        if (!name?.value) {
            name?.parentNode.classList.add('error')
            name?.parentNode.setAttribute('error', 'Invalid Ability / Item')
            failed = true
        }
        if (!keybind?.value) {
            keybind?.parentNode.classList.add('error')
            keybind?.parentNode.setAttribute('error', 'Invalid Keybind')
            failed = true
        }
        if (!bar?.value) {
            bar?.parentNode.classList.add('error')
            bar?.parentNode.setAttribute('error', 'Invalid Bar')
            failed = true
        }
        binds.push({ name: name.value, keybind: keybind.value, bar: bar.value })
    })
    if (failed) return

    request('keybindsListener', binds)
    toggle(true)
}

new Dropdown(document.querySelector('div[search]'), library.map(set => set.name))

document.querySelector('div[clear]').onclick = _ => {
    document.querySelector('input[search]').value = ''
    document.querySelectorAll('div[keys] > div[id]').forEach(element => element.classList.contains('hide') ? element.classList.remove('hide') : void 0)
    document.querySelector('div[clear]').classList.contains('active') ? document.querySelector('div[clear]').classList.remove('active') : void 0;
    toggleClear()
}

document.querySelectorAll('div[options] div[list] > div').forEach(element => {
    element.onclick = _ => {
        document.querySelectorAll('div[options] div[list] > div').forEach(element => element.classList.contains('active') ? element.classList.remove('active') : void 0)
        element.classList.add('active')
        if (element.innerHTML.split(' ').pop() === 'Item') toggles.search = 'name'
        else toggles.search = element.innerHTML.split(' ').pop().toLowerCase()
        var search = document.querySelector('div[search] input');
        search.parentNode.replaceChild(search.cloneNode(true), search);
        switch (toggles.search) {
            case 'name': {
                new Dropdown(document.querySelector('div[search]'), library.map(set => set.name))
                break;
            }

            case 'keybinds': {
                new Keybind(document.querySelector('div[search] input'))
                break
            }

            case 'bars': {
                new Dropdown(document.querySelector('div[search]'), ['Global', ...config.referenceStorage.bars])
                break;
            }
        }
        document.querySelector('div[search]').id = element.innerHTML
        document.querySelector('div[search] input').placeholder = element.innerHTML
    }
})


document.querySelectorAll('div[order] div[list] > div').forEach(element => {
    element.onclick = _ => {
        document.querySelectorAll('div[order] div[list] > div').forEach(element => element.classList.contains('active') ? element.classList.remove('active') : void 0)
        element.classList.add('active')
        if (element.innerHTML.split(' ').pop() === 'Item') toggles.order.query = 'name'
        else toggles.order.query = element.innerHTML.split(' ').pop().toLowerCase()
        toggleOrder(true)
    }
})

document.querySelector('div[order] div[action]').onclick = _ => !toggles.order.available ? toggleOrder(true) : void 0

document.querySelectorAll('div[filter] div[list] > div').forEach(element => {
    element.onclick = _ => {
        if (toggles.filter.includes(element.innerHTML)) {
            element.classList.remove('active')
            toggles.filter = toggles.filter.filter(set => set !== element.innerHTML)
        } else {
            element.classList.add('active')
            toggles.filter.push(element.innerHTML)
        }
        if (!toggles.filter.length) document.querySelectorAll('div[keys] > div[id]:not([search])').forEach(element => element.classList.contains('hide') ? element.classList.remove('hide') : void 0)
        else {
            document.querySelectorAll('div[keys] > div[id]:not([search])').forEach(element => {
                const input = element.querySelector('div[name] input').value
                const set = library.find(set => set.name === input)
                if (input && !toggles.filter.includes(set.type.split('-').map(word => word.slice(0, 1).toUpperCase() + word.slice(1)).join(' '))) element.classList.add('hide')
                else element.classList.contains('hide') ? element.classList.remove('hide') : void 0;
            })
        }
    }
})

document.querySelector('div[closeMount]').onclick = _ => {
    document.querySelector('div[pickerMount]').classList.add('hide')
    toggles.popup = null
}

document.querySelector('div[revertImage]').onclick = _ => {
    if (!toggles.popup) return
    const name = document.getElementById(toggles.popup).querySelector('div[name] input').value
    if (!name) return
    request('keybindsListener', { type: 'revertImage', name })
    document.querySelector('div[revertImage]').classList.add('disable')
    document.querySelector('div[imagePicker] div[image]').style.background = `url(${library.find(set => set.name === name).icon})`
    const image = document.getElementById(toggles.popup).querySelector('div[image]')
    image.classList.contains('active') ? image.classList.remove('active') : void 0
    library = request('config', true).library
}

document.querySelector('div[modifyImage]').onclick = _ => {
    if (!toggles.popup) return
    request('keybindsListener', { type: 'dialog', name: document.getElementById(toggles.popup).querySelector('div[name] input').value, id: toggles.popup })
}

ipc.on('customIcon', (event, param) => {
    if (!toggles.popup) return
    document.getElementById(param.id).querySelector('div[image]').classList.add('active')
    document.querySelector('div[imagePicker] div[image]').style.background = `url(${param.customIcon})`
    document.querySelector('div[revertImage]').classList.contains('disable') ? document.querySelector('div[revertImage]').classList.remove('disable') : void 0
    library = request('config', true).library
})