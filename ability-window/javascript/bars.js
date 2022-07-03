const [toggles, element, actions] = [
    {
        save: false,
        edit: false,
        saveMod: {
            value: null,
            id: null
        }
    },
    id => `<div id=${id}><div remove>-</div><div id="Bar Name" bar><input type="text" placeholder="Bar Name" /></div><div buttons><div edit>Edit</div><div saveMod>Save</div><div cancel>Cancel</div></div></div>`,
    `<div manage><div onclick="copy()" button>+ New Bar</div><div onclick="save()" button save>Save</div></div>`
]


function copy(initial, data) {
    const [_global, id, manage] = [initial ? data.value === 'Global' : false, random(), document.querySelector('div[manage]')]
    manage ? manage.remove() : void 0;
    document.querySelector('div[bars]').insertAdjacentHTML('beforeend', element(id));
    document.querySelector('div[bars]').insertAdjacentHTML('beforeend', actions);
    const component = document.getElementById(id);
    const bar = component.querySelector('div[bar]')
    const input = component.querySelector('input');
    component.querySelector('div[remove]').onclick = _ => {
        component.remove()
        toggle()
    }
    input.value = initial ? data.value : '';
    bar.setAttribute('info', initial ? data.count : 0);
    if (_global) {
        bar.id = '(Non-switching)'
        component.classList.add('global')
        component.removeAttribute('id')
    }
    const [edit, saveMod, cancel] = component.querySelectorAll('div[buttons] div');
    if (!initial) {
        edit.style.display = 'none';
        bar.classList.add('new')
    }

    input.onfocus = _ => {
        input.select()
        bar.classList.contains('error') ? bar.classList.remove('error') : void 0;
    }

    edit.onclick = _ => {
        if (_global || toggles.edit) return
        input.focus();
        input.select();
        toggles.edit = true;
        toggles.saveMod.value = input.value;
        toggles.saveMod.id = id;
        edit.style.display = 'none';
        saveMod.style.display = 'block';
        cancel.style.display = 'block';
        bar.classList.add('edit');
        document.querySelector('div[manage]').classList.add('disable')
        component.querySelector('div[remove]').classList.add('disable')
        document.querySelector('div[save]').classList.contains('active') ? document.querySelector('div[save]').classList.remove('active') : void 0;
        document.querySelectorAll('div[edit]').forEach(element => element.setAttribute('disabled', ''))
        document.querySelectorAll('div:not(.global) div[remove]').forEach(element => element.setAttribute('disabled', ''))
        document.querySelector('div[clear]').classList.add('disable')
        document.querySelector('div[search]').classList.add('disable')
        toggle()
    }

    saveMod.onclick = _ => {
        if (!toggles.saveMod.id) return
        const value = input.value;
        if (value === '') revert()
        else {
            toggles.saveMod.value = value
            revert()
            save()
        }
    }

    cancel.onclick = revert

    if (!initial) window.scrollTo(0, document.body.scrollHeight);

    function revert() {
        input.value = toggles.saveMod.value;
        toggles.edit = false;
        toggles.saveMod.value = null;
        toggles.saveMod.id = null;
        edit.style.display = 'block';
        saveMod.style.display = 'none';
        cancel.style.display = 'none';
        bar.classList.remove('edit')
        document.querySelector('div[manage]').classList.remove('disable')
        component.querySelector('div[remove]').classList.remove('disable')
        document.querySelectorAll('div[edit]').forEach(element => element.removeAttribute('disabled'))
        document.querySelectorAll('div:not(.global) div[remove]').forEach(element => element.removeAttribute('disabled'))
        document.querySelector('div[clear]').classList.remove('disable')
        document.querySelector('div[search]').classList.remove('disable')
    }
}

function save() {
    const bars = []
    let failed = false
    document.querySelectorAll('div[bars] div:not(.global) div[bar]').forEach(bar => {
        const value = bar.querySelector('input').value;
        if (!value) {
            bar.classList.add('error')
            bar.setAttribute('error', 'Invalid name')
            failed = true
        } else if (bars.includes(value)) {
            toggle()

            document.querySelectorAll(`input`).forEach(input => {
                if (input.value === value) {
                    input.parentNode.classList.add('error')
                    input.parentNode.setAttribute('error', 'Duplicate name')
                }
            })
            failed = true
        } else {
            if (bar.classList.contains('new')) {
                bar.classList.remove('new')
                bar.parentNode.querySelector('div[edit]').style.display = 'block'
            }
            bar.classList.contains('error') ? bar.classList.remove('error') : void 0;
            bars.push(value)
        }
    })
    if (!failed) {
        request('barsListener', bars)
        toggle(true)
    }
}

function toggle(value) {
    const save = document.querySelector('div[save]')
    toggles.save = value ? true : false;
    if (toggles.save) save.classList.add('active')
    else save.classList.contains('active') ? save.classList.remove('active') : void 0;
}

['Global', ...config.referenceStorage.bars].map(value => copy(true, { value, count: 0 }))
toggle(true)

document.querySelector('div[clear]').onclick = _ => {
    document.querySelector('input[search]').value = ''
    document.querySelector('div.global').style.display = 'flex';
    document.querySelectorAll('div[bars] > div[id]').forEach(bar => bar.style.display = 'flex')
    document.querySelector('div[clear]').classList.contains('active') ? document.querySelector('div[clear]').classList.remove('active') : void 0;
}

document.querySelector('input[search]').addEventListener('input', _ => {
    const value = document.querySelector('input[search]').value;
    if (value === '') {
        document.querySelector('div.global').style.display = 'flex';
        document.querySelector('div[clear]').classList.contains('active') ? document.querySelector('div[clear]').classList.remove('active') : void 0;
    }
    else {
        document.querySelector('div.global').style.display = 'none';
        !document.querySelector('div[clear]').classList.contains('active') ? document.querySelector('div[clear]').classList.add('active') : void 0;
    }
    document.querySelectorAll('div[bars] > div[id]').forEach(bar => {
        if (!bar.querySelector('input').value.toLowerCase().includes(value.toLowerCase())) bar.style.display = 'none';
        else bar.style.display = 'flex';
    })
})