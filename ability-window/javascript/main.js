const saveInfo = false;

for (const property in config) {
    const element = $$$(property);
    if (element) {
        element.getAttribute('type') === 'checkbox' ? (element.checked = config[property]) : (element.value = config[property]);
        switch (element.id) {
            case 'lockTrackerWindow': {
                lockTrackerWindowToggle();
                element.addEventListener('change', lockTrackerWindowToggle);
                break;
            }

            case 'barsSelection': {
                new Dropdown(element.parentNode, ['Global', ...config.referenceStorage.bars.map(e => (e?.name ? e.name : e))], true);
                break;
            }
        }
    }
}

if (!config.referenceStorage.bars.length) $('label[bars]').classList.add('disabled');

$$('input[id]').forEach(input => {
    input.onclick = _ => {
        if (input.id === 'lockTrackerWindow') lockTrackerWindowToggle();
        request('confListener', { id: input.id, value: input.value });
    };
});
$$('div[buttons] > div').forEach(button => (button.onclick = _ => request('mainListener', button.id)));

const slider = $$$('numberOfIcons');
$('b[label]').innerHTML = config.numberOfIcons;
slider.onclick = null;
slider.addEventListener('input', _ => {
    $('b[label]').innerHTML = slider.value;
    request('confListener', { id: slider.id, value: parseInt(slider.value) });
});

const dropdown = $$$('barsSelection');
dropdown.onclick = null;

function lockTrackerWindowToggle() {
    const checked = $$$('lockTrackerWindow').checked;
    $('label[lock] > span').innerHTML = checked ? '🔒' : '🔓';
    checked ? $('div[slider]').classList.add('disable') : $('div[slider]').classList.remove('disable');
}

function update(id, value) {
    $(`div#${id} input`).value = value;
    request('confListener', { id: 'barsSelection', value });
}

ipc.on('closed', (event, param) => {
    if (param === 'ability') {
        $$$(param).style.backgroundColor = 'var(--green)'
        $$$(param).innerHTML = 'Start Ability Tracker';
    }
});

ipc.on('opened', (event, param) => {
    if (param === 'ability') {
        $$$(param).style.backgroundColor = 'var(--red)'
        $$$(param).innerHTML = 'Stop Ability Tracker';
    }
});

ipc.on('fromBars', (event, param) => {
    if (!Array.isArray(param)) {
        if ($$$('barsSelection').value === param.before) {
            $$$('barsSelection').value = param.after ?? 'Global';
        }
        $$$('barsSelection').parentNode.replaceChild($$$('barsSelection').cloneNode(true), $$$('barsSelection'));
        new Dropdown($$$('barsSelection').parentElement, ['Global', ...request('config').referenceStorage.bars.map(bar => (bar?.name ? bar.name : bar))], true);
    } else if (!param.length) {
        $('label[bars]').classList.add('disabled');
        $('label[bars] input').checked = false;
        $$$('barsSelection').parentNode.replaceChild($$$('barsSelection').cloneNode(true), $$$('barsSelection'));
        new Dropdown($$$('barsSelection').parentElement, ['Global', ...param.map(bar => (bar?.name ? bar.name : bar))], true);
    } else {
        $$$('barsSelection').parentNode.replaceChild($$$('barsSelection').cloneNode(true), $$$('barsSelection'));
        new Dropdown($$$('barsSelection').parentElement, ['Global', ...param.map(bar => (bar?.name ? bar.name : bar))], true);
        $('label[bars]').classList.remove('disabled');
    }
});

ipc.on('fromTrigger', (event, param) => {
    $$$('barsSelection').value = param;
});

ipc.on('presetManager', (event, param) => {
    if (param.error) return alert(`Error: '${param.error}', please check the config and try again.`);
    switch (param.message) {
        case 'export':
            alert('Exported Config!');
            break;

        case 'import':
            {
                const _alertMsg = {
                    name: param?.name.split(/\\/g).pop().split('.')?.[0] ?? null,
                    keybinds: param?.data.keybinds.length ?? null,
                    bars: param?.data.bars.length ?? null,
                };
                alert(
                    `Imported '${_alertMsg.name}' config successfully with ${_alertMsg.keybinds} keybind${_alertMsg.keybinds > 1 ? 's' : ''} and ${_alertMsg.bars} bar${_alertMsg.bars > 1 ? 's' : ''}!`
                );
            }
            break;

        case 'failed_import':
            alert('Failed to Import Config, check the config and try again.');
            break;
        case 'failed_export':
            alert('Failed to Export Config, check the config and try again.');
            break;
        default:
            break;
    }
});
