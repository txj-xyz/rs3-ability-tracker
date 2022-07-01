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
    _global ? bar.id = '(Non-switching)' : void 0;
    _global ? component.classList.add('global') : void 0;
    const [edit, save, cancel] = component.querySelectorAll('div[buttons] div');
    if (!initial) {
        edit.style.display = 'none';
        bar.classList.add('new')
    }

    edit.onclick = _ => {
        if (_global || toggles.edit) return
        input.focus();
        input.select();
        toggles.edit = true;
        toggles.saveMod.value = input.value;
        toggles.saveMod.id = id;
        edit.style.display = 'none';
        save.style.display = 'block';
        cancel.style.display = 'block';
        bar.classList.add('edit');
        document.querySelector('div[manage]').classList.add('disable')
        component.querySelector('div[remove]').classList.add('disable')
        document.querySelector('div[save]').classList.contains('active') ? document.querySelector('div[save]').classList.remove('active') : void 0;
        toggle()
    }

    save.onclick = _ => {
        if (!toggles.saveMod.id) return
        const value = input.value;
        if (value === '') revert()
        else {
            request('barsListener', { before: toggles.saveMod.value, after: value })
            toggles.saveMod.value = value
            revert()
        }
    }

    cancel.onclick = revert

    function revert() {
        input.value = toggles.saveMod.value;
        toggles.edit = false;
        toggles.saveMod.value = null;
        toggles.saveMod.id = null;
        edit.style.display = 'block';
        save.style.display = 'none';
        cancel.style.display = 'none';
        bar.classList.remove('edit')
        document.querySelector('div[manage]').classList.remove('disable')
        component.querySelector('div[remove]').classList.remove('disable')
    }
}

function save() {
    const bars = []
    document.querySelectorAll('div[bars] div:not(.global) div[bar]').forEach(bar => {
        const value = bar.querySelector('input').value;
        if (!value) {
            bar.classList.add('error')
            bar.setAttribute('error', 'Invalid name')
        } else if (bars.includes(value)) {
            document.querySelectorAll(`input[value="${value}"]`).forEach(input => {
                input.classList.add('error')
                input.setAttribute('error', 'Duplicate name')
            })
        } else {
            if (bar.classList.contains('new')) {
                bar.classList.remove('new')
                bar.parentNode.querySelector('div[edit]').style.display = 'block'
            }
            bar.classList.contains('error') ? bar.classList.remove('error') : void 0;
            bars.push(value)
        }
    })
    request('barsListener', bars)
    toggle(true)
}

function toggle(value) {
    const save = document.querySelector('div[save]')
    toggles.save = value ? true : false;
    if (toggles.save) save.classList.add('active')
    else save.classList.contains('active') ? save.classList.remove('active') : void 0;
}

['Global', ...config.referenceStorage.bars].map(value => copy(true, { value, count: 0 }))
toggle(true)