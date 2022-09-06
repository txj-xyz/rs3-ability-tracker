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
    (id, preset) => `<div id="${id}" empty><div remove>-</div><div abilityIcon><img /><img /></div><div name id="${!preset ? 'Ability / Item' : 'Preset Name'}"><input type="text" placeholder="${!preset ? 'Ability / Item' : 'Preset Name'}" /><div dropdown></div></div> <div keybinds id="Keybind"><input type="text" placeholder="Keybind" /></div><div perkMod></div><div image>&#x1F5BC;&#xFE0F;</div></div>`,
    `<div manage><div onclick="copy()" button>+ New Bind</div><div onclick="save()" button save>Save</div><div onclick="cancel()" class="active" button cancel>Cancel</div></div>`
]

const bind = `
                <div empty style="padding-top: 10px; border-radius: 0 5px 0 0;">
                    <div remove>&#x1F504;</div>
                    <div abilityicon><img><img></div>
                    <div name id="Ability / Item">
                        <input type="text" placeholder="Ability / Item" style="border-radius: 3px;">
                        <div dropdown style="display: none;"></div>
                    </div>
                    <div keybinds id="Keybind">
                        <input type="text" placeholder="Keybind">
                    </div>
                    <div perkmod class="disable">
                        🔧
                        <div list></div>
                    </div>
                    <div image class="disable">🖼️</div>
                </div>
`



const perks = [...library.filter(set => set.icon.includes('/perks')).filter(set => set.type === 'perks').map(n => n.name)];

[...config.referenceStorage.bars, { name: 'Global', key: null }].map(bar => $('.tabs').innerHTML += `<div onclick="toggleTab('${bar.name}')" class="${config.barsSelection === bar.name ? 'active' : ''}">${bar.name}</div>`)
$('.tabs').innerHTML += '<div class="add" onclick="addTab()">+</div>'
toggleTab(config.barsSelection)


function toggleTab(bar) {
    // $('main').innerHTML = ''
    $$('.tabs > div').forEach(div => div.classList.remove('active'))
    $(`.tabs > div[onclick="toggleTab('${bar}')"]`).classList.add('active')

    // $('main').innerHTML = element('', true)
    // new Keybind($('main div[keybinds] input'))


    // const keys = config.referenceStorage.keybinds.filter(e => e.bar === bar)
    // if (keys.length) keys.map(key => copy(true, key))
    // else {
    //     $('main').insertAdjacentHTML('beforeend', actions)
    //     $('div[manage]').style.borderRadius = '5px'
    // }
    // toggle(true)
}

// if (config.referenceStorage.keybinds.length) config.referenceStorage.keybinds.map(set => copy(true, set))
// else $('main').insertAdjacentHTML('beforeend', actions)

$('div[filter] div[list]').innerHTML = `<div>${[...new Set(library.map(set => 'Filter by ' + set.type.split('-').map(word => word.slice(0, 1).toUpperCase() + word.slice(1)).join(' ')))].join('</div><div>')}</div>`

function getImg(query, raw) {
    const data = library.find(element => element.name === query)
    return raw && data ? `url(${data.customIcon ?? data.icon.replace(/\(/g, '%28').replace(/\)/g, '%29')})` : data ? `<div style="background: url(${data.icon.replace(/\(/g, '%28').replace(/\)/g, '%29')}); width: 10px; height: 10px;" abilityImg></div>` : ''
}

function copy(initial, data) {
    const [id, manage] = [random(), $('div[manage]')]
    manage ? manage.remove() : void 0;
    $('main').insertAdjacentHTML('beforeend', element(id));
    $('main').insertAdjacentHTML('beforeend', actions);
    const component = $$$(id);
    const name = component.querySelector('div[name] input')
    const keybind = component.querySelector('div[keybinds] input')
    const abilityIcon = component.querySelector('div[abilityIcon]')
    initial ? abilityIcon.style.background = getImg(data.name, true) : void 0
    let set = initial ? library.find(set => set.name === data.name) : null

    component.querySelector('div[remove]').onclick = _ => {
        component.remove()
        toggle()
        toggleOrder()
    }

    if (set && set.customIcon) {
        component.querySelector('div[image]').classList.add('active')
        $('div[revertImage]').classList.contains('disable') ? $('div[revertImage]').classList.remove('disable') : void 0
    } else $('div[revertImage]').classList.add('disable')

    // let weapon = set.icon.match(/weapons\/(magic|melee|range)/g)
    component.querySelector('div[perkMod]').innerHTML = `&#x1F527;<div list><div>${perks.join('</div><div>')}</div></div>`
    component.querySelectorAll('div[perkMod] div[list] > div').forEach(div => div.onclick = _ => {
        toggle()
        const active = div.classList.contains('active')
        component.querySelector('div[perkMod]').classList.add('active')
        component.querySelectorAll('div[perkMod] div[list] > div').forEach(e => e.classList.contains('active') ? e.classList.remove('active') : void 0)
        if (!active) {
            div.classList.add('active')
            component.querySelector('div[abilityIcon] img').src = getImg(div.innerText, true).slice(4, -1)
        } else {
            component.querySelector('div[perkMod]').classList.remove('active')
            component.querySelector('div[abilityIcon] img').src = ''
        }
    })

    if (initial && data.perk) {
        component.querySelector('div[perkMod]').classList.add('active')
        component.querySelectorAll('div[perkMod] div[list] > div').forEach(div => div.innerHTML === data.perk ? div.classList.add('active') : void 0)
        component.querySelector('div[abilityIcon] img').src = getImg(data.perk, true).slice(4, -1)
    }

    const weapon = set ? set.icon.match(/weapons\/(magic|melee|range)/g) : false
    if ((Array.isArray(weapon) && weapon.some(e => e)) || (set && set.type === 'slot-icons')) $$$(id).querySelector('div[perkMod]').classList.contains('disable') ? $$$(id).querySelector('div[perkMod]').classList.remove('disable') : void 0
    else $$$(id).querySelector('div[perkMod]').classList.add('disable')


    component.querySelector('div[image]').onclick = _ => {
        toggles.popup = id;
        const pickerMount = $('div[pickerMount]')
        pickerMount.classList.contains('hide') ? pickerMount.classList.remove('hide') : void 0;
        set = library.find(set => set.name === name.value)
        if (set && set.customIcon) {
            component.querySelector('div[image]').classList.add('active')
            $('div[revertImage]').classList.contains('disable') ? $('div[revertImage]').classList.remove('disable') : void 0
        } else $('div[revertImage]').classList.add('disable')
        document.documentElement.style.setProperty('--revertImg', `url(${set.icon})`);
        $('div[imagePicker] div[image]').style.background = `url(${set.customIcon ?? set.icon})`
    }

    name.value = initial ? data.name : '';
    keybind.value = initial ? data.keybind : '';

    new Dropdown(component, library.map(set => set.name), initial, 'name')
    new Keybind(keybind)

    if (!initial) {
        component.querySelector('div[image]').classList.add('disable')
        // window.scrollTo(0, document.body.scrollHeight);
        toggleOrder()
        toggle()
    } else toggle(true)
}

function toggle(value) {
    const save = $('div[save]')
    const cancel = $('div[cancel]')
    toggles.save = value ? true : false;
    if (toggles.save) {
        cancel.classList.add('disable')
        cancel.classList.remove('active')
        save.classList.add('disable')
        save.classList.add('active')
    }
    else {
        save.classList.contains('active') ? save.classList.remove('active') : void 0;
        cancel.classList.remove('disable')
        save.classList.remove('disable')
        cancel.classList.add('active')
    }
}

function toggleImage(id, value) {
    const elem = $$$(id)
    if (!elem) return;
    const image = elem ? $$$(id).querySelector('div[image]') : void 0
    const item = config.referenceStorage.keybinds.find(e => e.name === value && e.keybind === $$$(id).querySelector('div[keybinds] input').value)
    if (!value) {
        if (image) {
            image.classList.add('disable')
            image.classList.remove('active')
        }
        $$$(id).querySelector('div[abilityIcon]').style.background = ''
        $$$(id).querySelector('div[perkMod]').classList.add('disable')
        $$$(id).querySelector('div[perkMod]').classList.remove('active')
        $$$(id).querySelectorAll('div[perkMod] div[list] > div').forEach(div => div.classList.remove('active'))
        $$$(id).querySelector('div[abilityIcon] img').src = ''
    }
    else {
        image.classList.contains('disable') ? image.classList.remove('disable') : void 0
        let set = library.find(set => set.name === $$$(id).querySelector('div[name] input').value)
        if (set) {
            if (set.customIcon) image.classList.add('active')
            $$$(id).querySelector('div[abilityIcon]').style.background = getImg(set.name, true)
            const perkMod = $$$(id).querySelector('div[perkMod]')
            perkMod.classList.contains('disable') ? perkMod.classList.remove('disable') : void 0

            const weapon = set.icon.match(/weapons\/(magic|melee|range)/g)
            if ((Array.isArray(weapon) && weapon.some(e => e)) || set.type === 'slot-icons') $$$(id).querySelector('div[perkMod]').classList.contains('disable') ? $$$(id).querySelector('div[perkMod]').classList.remove('disable') : void 0
            else $$$(id).querySelector('div[perkMod]').classList.add('disable')
        }

        if (item && item.perk) {
            $$$(id).querySelector('div[perkMod]').classList.add('active')
            $$$(id).querySelectorAll('div[perkMod] div[list] > div').forEach(div => div.innerHTML === item.perk ? div.classList.add('active') : void 0)
            $$$(id).querySelector('div[abilityIcon] img').src = getImg(item.perk, true).slice(4, -1)
        }
    }
}

function toggleOrder(value) {
    const order = $('div[order]')
    toggles.order.available = value ? true : false;
    if (toggles.order.available) {
        order.classList.add('active')
        const list = []
        $$('div[keys] > div[id]:not([search])').forEach(element => {
            const name = element.querySelector('div[name] input');
            const keybind = element.querySelector('div[keybinds] input');
            const bar = element.querySelector('div[bars] input');
            list.push({ name: name.value, keybinds: keybind.value, bars: bar.value })
        })
        $$('div[keys] > div[id]:not([search])').forEach(element => element.remove())
        list.sort((a, b) => a[toggles.order.query] > b[toggles.order.query] ? 1 : -1).map(set => copy(true, { name: set.name, keybind: set.keybinds, bar: set.bars }))
    }
    else order.classList.contains('active') ? order.classList.remove('active') : void 0;
}

function toggleClear(value) {
    const clear = $('div[clear]')
    toggles.clear = value ? true : false;
    if (toggles.clear) clear.classList.add('active')
    else clear.classList.contains('active') ? clear.classList.remove('active') : void 0;
}

function update(id, value, query) {
    if (query === 'undefined') {
        $('div[search] input').value = value;
        $$(`div[keys] > div[id]:not([search])`).forEach(element => {
            const input = element.querySelector(`div[${toggles.search}] input`)
            if (!input.value.includes(value)) input.parentNode.parentNode.classList.add('hide')
            else input.parentNode.parentNode.classList.contains('hide') ? input.parentNode.parentNode.classList.remove('hide') : void 0;
        })
        return toggleClear(true)
    }
    if (query === 'name') {
        $$$(id).querySelector('div[perkMod]').classList.remove('active')
        $$$(id).querySelectorAll('div[perkMod] div[list] > div').forEach(div => div.classList.remove('active'))
        $$$(id).querySelector('div[abilityIcon] img').src = ''
    }
    $$$(id).querySelector(`div[${query}] input`).value = value;
    $$$(id).querySelector('div[abilityIcon]').style.background = getImg(value, true)
    let set = library.find(set => set.name === value)
    const weapon = set ? set.icon.match(/weapons\/(magic|melee|range)/g) : false
    if ((Array.isArray(weapon) && weapon.some(e => e)) || (set && set.type === 'slot-icons')) $$$(id).querySelector('div[perkMod]').classList.contains('disable') ? $$$(id).querySelector('div[perkMod]').classList.remove('disable') : void 0
    else $$$(id).querySelector('div[perkMod]').classList.add('disable')
    const item = config.referenceStorage.keybinds.find(e => e.name === value && e.keybind === $$$(id).querySelector('div[keybinds] input').value)
    if (item && item.perk) {
        $$$(id).querySelector('div[perkMod]').classList.add('active')
        $$$(id).querySelectorAll('div[perkMod] div[list] > div').forEach(div => div.innerHTML === item.perk ? div.classList.add('active') : void 0)
        $$$(id).querySelector('div[abilityIcon] img').src = getImg(item.perk, true).slice(4, -1)
    }
    if (set && set.customIcon) {
        $$$(id).querySelector('div[image]').classList.add('active')
        $('div[revertImage]').classList.contains('disable') ? $('div[revertImage]').classList.remove('disable') : void 0
    } else $('div[revertImage]').classList.add('disable')
    toggles.save ? toggle() : void 0;
    toggleImage(id, true)
}

function save() {
    let failed = false;
    const binds = []
    if ($('div.error')) return
    $$('div[keys] > div[id]:not([search])').forEach(element => {
        const name = element.querySelector('div[name] input');
        const keybind = element.querySelector('div[keybinds] input');
        const bar = element.querySelector('div[bars] input');
        const perk = element.querySelector('div[perkMod]:not(.disable) div.active');
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
        binds.push({ name: name.value, keybind: keybind.value, bar: bar.value, perk: perk ? perk.innerHTML : null })
        binds.forEach(set => {
            if (binds.filter(e => e.name === set.name && e.keybind === set.keybind && e.bar === set.bar).length > 1 && !failed) {
                failed = true

                keybind?.parentNode.classList.add('error')
                keybind?.parentNode.setAttribute('error', 'Duplicate Item / Keybind / Bar')
            }
            // } else if (binds.filter(e => e.bar === set.bar && e.name === set.name).length > 1 && !failed) {
            //     failed = true
            //     keybind?.parentNode.classList.add('error')
            //     keybind?.parentNode.setAttribute('error', 'Duplicate Keybind')
            // }
        })
    })
    if (failed) return

    request('presetsListener', binds)
    toggle(true)
}

new Dropdown($('div[search]'), library.map(set => set.name))

$('div[clear]').onclick = _ => {
    $('input[search]').value = ''
    $$('div[keys] > div[id]').forEach(element => element.classList.contains('hide') ? element.classList.remove('hide') : void 0)
    $('div[clear]').classList.contains('active') ? $('div[clear]').classList.remove('active') : void 0;
    toggleClear()
}

$$('div[options] div[list] > div').forEach(element => {
    element.onclick = _ => {
        $$('div[options] div[list] > div').forEach(element => element.classList.contains('active') ? element.classList.remove('active') : void 0)
        element.classList.add('active')
        if (element.innerHTML.split(' ').pop() === 'Item') toggles.search = 'name'
        else toggles.search = element.innerHTML.split(' ').pop().toLowerCase()
        var search = $('div[search] input');
        search.parentNode.replaceChild(search.cloneNode(true), search);
        switch (toggles.search) {
            case 'name': {
                new Dropdown($('div[search]'), library.map(set => set.name))
                break;
            }

            case 'keybinds': {
                new Keybind($('div[search] input'))
                break
            }

            case 'bars': {
                new Dropdown($('div[search]'), ['Global', ...config.referenceStorage.bars.map(bar => bar?.name ? bar.name : bar)])
                break;
            }
        }
        $('div[search] input').placeholder = element.innerHTML
    }
})


$$('div[order] div[list] > div').forEach(element => {
    element.onclick = _ => {
        $$('div[order] div[list] > div').forEach(element => element.classList.contains('active') ? element.classList.remove('active') : void 0)
        element.classList.add('active')
        if (element.innerHTML.split(' ').pop() === 'Item') toggles.order.query = 'name'
        else toggles.order.query = element.innerHTML.split(' ').pop().toLowerCase()
        toggleOrder(true)
    }
})

$('div[order] div[action]').onclick = _ => !toggles.order.available ? toggleOrder(true) : void 0

$$('div[filter] div[list] > div').forEach(element => {
    element.onclick = _ => {
        if (toggles.filter.includes(element.innerHTML)) {
            element.classList.remove('active')
            toggles.filter = toggles.filter.filter(set => set !== element.innerHTML)
        } else {
            element.classList.add('active')
            toggles.filter.push(element.innerHTML)
        }
        if (!toggles.filter.length) $$('div[keys] > div[id]:not([search])').forEach(element => element.classList.contains('hide') ? element.classList.remove('hide') : void 0)
        else {
            $$('div[keys] > div[id]:not([search])').forEach(element => {
                const input = element.querySelector('div[name] input').value
                const set = library.find(set => set.name === input)
                if (input && !toggles.filter.includes(set.type.split('-').map(word => word.slice(0, 1).toUpperCase() + word.slice(1)).join(' '))) element.classList.add('hide')
                else element.classList.contains('hide') ? element.classList.remove('hide') : void 0;
            })
        }
    }
})

$('div[closeMount]').onclick = _ => {
    $('div[pickerMount]').classList.add('hide')
    toggles.popup = null
}

$('div[revertImage]').onclick = _ => {
    if (!toggles.popup) return
    const name = $$$(toggles.popup).querySelector('div[name] input').value
    if (!name) return
    request('presetsListener', { type: 'revertImage', name })
    $('div[revertImage]').classList.add('disable')
    $('div[imagePicker] div[image]').style.background = `url(${library.find(set => set.name === name).icon})`
    const image = $$$(toggles.popup).querySelector('div[image]')
    image.classList.contains('active') ? image.classList.remove('active') : void 0
    library = request('config', true).library
    $$$(toggles.popup).querySelector('div[abilityIcon]').style.background = getImg(name, true)
}

$('div[modifyImage]').onclick = _ => {
    if (!toggles.popup) return
    request('presetsListener', { type: 'dialog', name: $$$(toggles.popup).querySelector('div[name] input').value, id: toggles.popup })
}

ipc.on('customIcon', (event, param) => {
    if (!toggles.popup) return
    $$$(param.id).querySelector('div[image]').classList.add('active')
    $('div[imagePicker] div[image]').style.background = `url(${param.customIcon})`
    $('div[revertImage]').classList.contains('disable') ? $('div[revertImage]').classList.remove('disable') : void 0
    library = request('config', true).library
    $$$(toggles.popup).querySelector('div[abilityIcon]').style.background = getImg(param.name, true)
})

// ipc.on('fromBars', (event, param) => {
//     if (!Array.isArray(param) || (Array.isArray(param) && param.some(e => e))) {
//         $$('div[keys] > div[id]:not([search]) div[bars]').forEach(div => {
//             div.classList.remove('disable')
//             const id = div.parentNode.id
//             div.parentNode.replaceChild(div.cloneNode(true), div);
//             new Dropdown($$$(id), ['Global', ...request('config').referenceStorage.bars], true, 'bars')
//         })
//         if (param.before) {
//             let disable = !request('config').referenceStorage.bars.length
//             $$('div[keys] > div[id]:not([search])').forEach(div => {
//                 const input = div.querySelector('div[name] input')
//                 const bar = div.querySelector('div[bars] input')
//                 if (disable) {
//                     input.blur()
//                     bar.parentNode.classList.add('disable')
//                 }
//                 if (input.value && param.before === bar.value) !param.after ? div.remove() : bar.value = param.after

//             })
//         }
//     } else {
//         $$('div[keys] > div[id]:not([search]) div[bars]').forEach(div => {
//             div.classList.add('disable')
//             div.querySelector('input').blur()
//         })
//     }
// })

function cancel() {
    if (!toggles.save) window.location.reload()
}

// const tabs = $('section.tabs');

// tabs.addEventListener('wheel', e => {
//     e.preventDefault();
//     tabs.scrollLeft += e.deltaY / 2;
// });