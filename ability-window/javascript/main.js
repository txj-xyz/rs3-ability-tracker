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
                new Dropdown(element.parentElement, config.referenceStorage.bars)
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
slider.onclick = null
slider.addEventListener('input', _ => {
    document.querySelector('b[label]').innerHTML = slider.value;
    request('confListener', { id: slider.id, value: parseInt(slider.value) })
});

function lockTrackerWindowToggle() {
    document.querySelector('label[lock] > span').innerHTML = document.getElementById('lockTrackerWindow').checked ? '🔒' : '🔓'
}

function update(id, value) {
    document.querySelector(`div#${id} input`).value = value
}