const saveInfo = false;

for (const property in config) {
    const element = document.getElementById(property)
    if (element) {
        element.getAttribute('type') === 'checkbox' ? element.checked = config[property] : element.value = config[property]
        switch (element.id) {
            case 'lockTrackerWindow': {
                lockTrackerWindowToggle()
                element.addEventListener('change', lockTrackerWindowToggle)
                break
            }

            case 'barsSelection': {
                new Dropdown(element.parentNode, ['Global', ...config.referenceStorage.bars.map(e => e?.name ? e.name : e)], true)
                break
            }
        }
    }
}

if (!config.referenceStorage.bars.length) document.querySelector('label[bars]').classList.add('disabled')

document.querySelectorAll('input[id]').forEach(input => {
    input.onclick = _ => {
        if (input.id === 'lockTrackerWindow') lockTrackerWindowToggle()
        request('confListener', { id: input.id, value: input.value })
    }
})
document.querySelectorAll('div[buttons] > div').forEach(button => button.onclick = _ => request('mainListener', button.id))

const slider = document.getElementById('numberOfIcons')
document.querySelector('b[label]').innerHTML = config.numberOfIcons;
slider.onclick = null
slider.addEventListener('input', _ => {
    document.querySelector('b[label]').innerHTML = slider.value;
    request('confListener', { id: slider.id, value: parseInt(slider.value) })
});

const dropdown = document.getElementById('barsSelection')
dropdown.onclick = null

function lockTrackerWindowToggle() {
    const checked = document.getElementById('lockTrackerWindow').checked
    document.querySelector('label[lock] > span').innerHTML = checked ? '🔒' : '🔓'
    checked ? document.querySelector('div[slider]').classList.add('disable') : document.querySelector('div[slider]').classList.remove('disable')
}

function update(id, value) {
    document.querySelector(`div#${id} input`).value = value
    request('confListener', { id: 'barsSelection', value })
}

ipc.on('closed', (event, param) => {
    if (param === 'ability') document.getElementById(param).innerHTML = 'Start Tracker'
})

ipc.on('opened', (event, param) => {
    if (param === 'ability') document.getElementById(param).innerHTML = 'Stop Tracker'
})

ipc.on('fromBars', (event, param) => {
    if (!Array.isArray(param)) {
        if(document.getElementById('barsSelection').value === param.before) {
            document.getElementById('barsSelection').value = param.after ?? 'Global'
        }
        document.getElementById('barsSelection').parentNode.replaceChild(document.getElementById('barsSelection').cloneNode(true), document.getElementById('barsSelection'));
        new Dropdown(document.getElementById('barsSelection').parentElement, ['Global', ...request('config').referenceStorage.bars.map(bar => bar?.name ? bar.name : bar)], true)
    }
    else if (!param.length) {
        document.querySelector('label[bars]').classList.add('disabled')
        document.querySelector('label[bars] input').checked = false
        document.getElementById('barsSelection').parentNode.replaceChild(document.getElementById('barsSelection').cloneNode(true), document.getElementById('barsSelection'));
        new Dropdown(document.getElementById('barsSelection').parentElement, ['Global', ...param.map(bar => bar?.name ? bar.name : bar)], true)
    } else {
        document.getElementById('barsSelection').parentNode.replaceChild(document.getElementById('barsSelection').cloneNode(true), document.getElementById('barsSelection'));
        new Dropdown(document.getElementById('barsSelection').parentElement, ['Global', ...param.map(bar => bar?.name ? bar.name : bar)], true)
        document.querySelector('label[bars]').classList.remove('disabled')

    }
})

ipc.on('fromTrigger', (event, param) => {
    document.getElementById('barsSelection').value = param;
})

ipc.on('presetManager', (event, param) => {
    if(param.error) return alert(`Error: '${param.error}', please check the config and try again.`)
    switch (param.message) {
        case 'export': alert('Exported Config!'); break;
        
        case 'import': {
            const _alertMsg = {
                name: param?.name.split(/\\/g).pop().split('.')?.[0] ?? null,
                keybinds: param?.data.keybinds.length ?? null,
                bars: param?.data.bars.length ?? null,
            }
            alert(`Imported '${_alertMsg.name}' config successfully with ${_alertMsg.keybinds} keybind${_alertMsg.keybinds > 1 ? 's' : ''} and ${_alertMsg.bars} bar${_alertMsg.bars > 1 ? 's' : ''}!`)
        };
        break;

        case 'failed_import': alert('Failed to Import Config, check the config and try again.'); break;
        case 'failed_export': alert('Failed to Export Config, check the config and try again.'); break;
        default: break;
    }
})