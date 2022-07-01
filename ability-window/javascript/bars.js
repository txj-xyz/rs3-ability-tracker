let toggles = {
    save: false,
    edit: false,
    saveMod: {
        value: null,
        id: null
    }
}

function copy(initial, data) {
    const [_global, id, manage] = [initial ? data.value === 'Global' : false, random(), document.querySelector('div[manage]')]
    manage ? manage.remove() : void 0;
    let element = `
        <div id=${id}>
            <div remove>-</div>
            <div id="Bar Name" bar><input type="text" placeholder="Bar Name" /></div>
            <div buttons>
                <div edit>Edit</div>
                <div saveMod>Save</div>
                <div cancel>Cancel</div>
            </div>
        </div>
    `
    let actions = `
    <div manage>
        <div onclick="copy()" button>+ New Bar</div>
        <div onclick="save()" button save>Save</div>
    </div>
    `
    document.querySelector('div[bars]').insertAdjacentHTML('beforeend', element);
    document.querySelector('div[bars]').insertAdjacentHTML('beforeend', actions);
    const component = document.getElementById(id);
    const input = component.querySelector('input');
    component.querySelector('div[remove]').onclick = _ => !_global ? component.remove() : void 0;
    input.value = initial ? data.value : '';
    component.querySelector('div[bar]').setAttribute('info', initial ? data.count : 0);
    _global ? component.querySelector('div[bar]').id = '(Non-switching)' : void 0;
    _global ? component.classList.add('global') : void 0;
    const [edit, save, cancel] = component.querySelectorAll('div[buttons] div');
    if (!initial) edit.style.display = 'none';

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
    }
    save.onclick = _ => {
        if (!toggles.saveMod.id) return
        const value = input.value;
        if (value === '') revert()
        else {/* emit */ }
    }
    cancel.onclick = _ => revert()

    function revert() {
        toggles.edit = false;
        toggles.saveMod.value = null;
        toggles.saveMod.id = null;
        input.value = toggles.saveMod.value;
        edit.style.display = 'block';
        save.style.display = 'none';
        cancel.style.display = 'none';
    }
}

['Global', ...config.referenceStorage.bars].map(value => {
    copy(true, { value, count: 0 })
})