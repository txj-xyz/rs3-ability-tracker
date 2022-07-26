let { library, keycodes } = request('config', true);
const [toggles, element, actions, notice] = [
    {
        save: false,
        edit: false,
        saveMod: {
            value: null,
            id: null,
        },
    },
    id =>
        `<div id=${id}><div remove>-</div><div id="Bar Name" bar><input type="text" placeholder="Bar Name" /></div><div keybinds id="Keybind"><input type="text" placeholder="Keybind" /> </div><div buttons><div edit>Edit</div><div saveMod>Save</div><div cancel>Cancel</div></div></div>`,
    `<div manage><div onclick="copy()" button>+ New Bar</div><div onclick="save()" button save>Save</div></div>`,
];

function copy(initial, data) {
    const [_global, id, manage] = [initial ? data.name === 'Global' : false, random(), document.querySelector('div[manage]')];
    manage ? manage.remove() : void 0;
    document.querySelector('div[bars]').insertAdjacentHTML('beforeend', element(id));
    document.querySelector('div[bars]').insertAdjacentHTML('beforeend', actions);
    const component = document.getElementById(id);
    const bar = component.querySelector('div[bar]');
    const keybind = component.querySelector('div[keybinds]');
    const input = bar.querySelector('input');

    component.querySelector('div[remove]').onclick = _ => {
        if (parseInt(component.querySelector('div[bar]').getAttribute('info').split(' ').shift()) > 3) {
            document.querySelector('div[popup] div[info]').innerHTML = `<p>Are you sure you want to remove the ${
                component.querySelector('div[bar] input').value
            } bar?</p><hr /><p>Doing so will delete ${component.querySelector('div[bar]').getAttribute('info').split(' ').shift()} binds.</p>`;
            document.querySelector('div[popup] div[button]:first-child').setAttribute('bar', component.id);
            const popup = document.querySelector('div[popup]');
            popup.style.transform = 'scale(1)';
            popup.style.opacity = 1;
            popup.style.pointerEvents = 'auto';
        } else {
            const value = component.querySelector('div[bar] input').value;
            component.remove();
            save(value);
            toggle(true);
        }
    };

    input.value = initial ? data.name : null;
    keybind.querySelector('input').value = initial ? data.key : null;
    new Keybind(keybind.querySelector('input'));

    bar.setAttribute('info', data && data.count === 1 ? '1 linked bind' : `${data?.count ?? 0} linked binds`);

    if (_global) {
        bar.id = '(Non-switching)';
        component.classList.add('global');
        component.removeAttribute('id');
    }
    const [edit, saveMod, cancel] = component.querySelectorAll('div[buttons] div');
    if (!initial) {
        edit.style.display = 'none';
        bar.classList.add('new');
        keybind.classList.add('new');
    }

    input.onfocus = _ => {
        input.select();
        bar.classList.contains('error') ? bar.classList.remove('error') : void 0;
    };

    edit.onclick = _ => {
        if (_global || toggles.edit) return;
        input.focus();
        input.select();
        toggles.edit = true;
        toggles.saveMod.value = input.value;
        toggles.saveMod.key = keybind.querySelector('input').value;
        toggles.saveMod.id = id;
        edit.style.display = 'none';
        saveMod.style.display = 'block';
        cancel.style.display = 'block';
        bar.classList.add('edit');
        keybind.classList.add('edit');
        document.querySelector('div[manage]').classList.add('disable');
        component.querySelector('div[remove]').classList.add('disable');
        document.querySelector('div[save]').classList.contains('active') ? document.querySelector('div[save]').classList.remove('active') : void 0;
        document.querySelectorAll('div[edit]').forEach(element => element.setAttribute('disabled', ''));
        document.querySelectorAll('div:not(.global) div[remove]').forEach(element => element.setAttribute('disabled', ''));
        document.querySelector('div[clear]').classList.add('disable');
        document.querySelector('div[search]').classList.add('disable');
        toggle();
    };

    saveMod.onclick = _ => {
        if (!toggles.saveMod.id) return;
        const value = input.value;
        const key = keybind.querySelector('input').value;
        if (value === '' || key === '') revert();
        else {
            const old = toggles.saveMod.value;
            toggles.saveMod.value = value;
            toggles.saveMod.key = key;
            revert();
            save(old, value, key);
            toggle(true);
        }
    };

    cancel.onclick = revert;

    if (!initial) window.scrollTo(0, document.body.scrollHeight);

    function revert() {
        input.value = toggles.saveMod.value;
        toggles.edit = false;
        toggles.saveMod.value = null;
        toggles.saveMod.id = null;
        edit.style.display = 'block';
        saveMod.style.display = 'none';
        cancel.style.display = 'none';
        bar.classList.remove('edit');
        keybind.classList.remove('edit');
        document.querySelector('div[manage]').classList.remove('disable');
        component.querySelector('div[remove]').classList.remove('disable');
        document.querySelectorAll('div[edit]').forEach(element => element.removeAttribute('disabled'));
        document.querySelectorAll('div:not(.global) div[remove]').forEach(element => element.removeAttribute('disabled'));
        document.querySelector('div[clear]').classList.remove('disable');
        document.querySelector('div[search]').classList.remove('disable');
    }
}

function save(old, value, key) {
    const bars = [];
    const keybinds = [];
    const data = [];
    let failed = false;
    if (old) return request('barsListener', { before: old, after: value, key });
    document.querySelectorAll('div[bars] > div[id]').forEach(set => {
        let bar = set.querySelector('div[bar]');
        let keybind = set.querySelector('div[keybinds]');
        if (!bar.querySelector('input') || !keybind.querySelector('input')) return;
        let barValue = bar.querySelector('input').value;
        let keybindValue = keybind.querySelector('input').value;

        if (!barValue) {
            bar.classList.add('error');
            bar.setAttribute('error', 'Invalid name');
            failed = true;
        } else if (bars.includes(barValue)) {
            toggle();

            document.querySelectorAll(`input`).forEach(input => {
                if (input.value === barValue) {
                    input.parentNode.classList.add('error');
                    input.parentNode.setAttribute('error', 'Duplicate name');
                }
            });
            failed = true;
        } else if (keybindValue && keybinds.includes(keybindValue)) {
            toggle();
            document.querySelectorAll(`input`).forEach(input => {
                if (input.value === keybindValue) {
                    input.parentNode.classList.add('error');
                    input.parentNode.setAttribute('error', 'Duplicate name');
                }
            });
            failed = true;
        } else {
            bar.classList.contains('new') ? (bar.parentNode.querySelector('div[edit]').style.display = 'block') : void 0;
            bar.classList.remove('new');
            keybind.classList.remove('new');

            bar.classList.remove('error');
            keybind.classList.remove('error');
            bars.push(barValue);
            keybindValue ? keybinds.push(keybindValue) : void 0;
            data.push({ name: barValue, key: keybindValue ?? null });
        }
    });

    if (!failed) {
        request('barsListener', data);
        toggle(true);
    }
}

function toggle(value) {
    const save = document.querySelector('div[save]');
    toggles.save = value ? true : false;
    if (toggles.save) {
        save.classList.add('disable');
        save.classList.add('active');
    } else {
        save.classList.contains('active') ? save.classList.remove('active') : void 0;
        save.classList.remove('disable');
    }
}

const bars = { Global: 0 };
config.referenceStorage.keybinds.forEach(bind => (bars[bind.bar] ? bars[bind.bar]++ : (bars[bind.bar] = 1)));
[{ name: 'Global', key: null }, ...config.referenceStorage.bars].map(value => copy(true, { ...value, count: bars[value.name] || null }));
toggle(true);

document.querySelector('div[clear]').onclick = _ => {
    document.querySelector('input[search]').value = '';
    document.querySelector('div.global').style.display = 'flex';
    document.querySelectorAll('div[bars] > div[id]').forEach(bar => (bar.style.display = 'flex'));
    document.querySelector('div[clear]').classList.contains('active') ? document.querySelector('div[clear]').classList.remove('active') : void 0;
};

document.querySelector('input[search]').addEventListener('input', _ => {
    const value = document.querySelector('input[search]').value;
    if (value === '') {
        document.querySelector('div.global').style.display = 'flex';
        document.querySelector('div[clear]').classList.contains('active') ? document.querySelector('div[clear]').classList.remove('active') : void 0;
    } else {
        document.querySelector('div.global').style.display = 'none';
        !document.querySelector('div[clear]').classList.contains('active') ? document.querySelector('div[clear]').classList.add('active') : void 0;
    }
    document.querySelectorAll('div[bars] > div[id]').forEach(bar => {
        if (!bar.querySelector('input').value.toLowerCase().includes(value.toLowerCase())) bar.style.display = 'none';
        else bar.style.display = 'flex';
    });
});

ipc.on('fromKeybinds', (event, param) => {
    const bars = { Global: 0 };
    param.forEach(bind => (bars[bind.bar] ? bars[bind.bar]++ : (bars[bind.bar] = 1)));
    document.querySelectorAll('div[bars] div[bar]').forEach(bar => {
        const name = bar.querySelector('input').value;
        const value = bars[name] || 0;
        alert(value)
        bar.setAttribute('info', value === 1 ? '1 linked bind' : `${value ? value : 0} linked binds`);
    });
});

document.querySelector('div[popup] div[button]:last-child').onclick = _ => {
    const popup = document.querySelector('div[popup]');
    popup.style.transform = 'scale(0.7)';
    popup.style.opacity = 0;
    popup.style.pointerEvents = 'none';
};

const confirm = document.querySelector('div[popup] div[button]:first-child');
confirm.onclick = _ => {
    const bar = document.getElementById(confirm.getAttribute('bar'));
    const value = bar ? bar.querySelector('input').value : null;
    bar.remove();
    document.querySelector('div[popup] div[button]:last-child').click();
    confirm.removeAttribute('bar');
    save(value);
    toggle(true);
};
