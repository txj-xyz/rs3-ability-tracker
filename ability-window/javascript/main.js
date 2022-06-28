for (const property in config) {
    const element = document.getElementById(property)
    if (element) element.getAttribute('type') === 'checkbox' ? element.checked = config[property] : element.value = config[property]
    if (element && element.id === 'lockTrackerWindow') {
        lockTrackerWindowToggle()
        element.addEventListener('change', lockTrackerWindowToggle)
    }
}

if (!config.referenceStorage.bars.length) document.querySelector('label.bars').classList.add('disabled')

document.querySelectorAll('input[id]').forEach(input => {
    // if (input.id === 'lockTrackerWindow') lockTrackerWindowToggle()
    input.onclick = _ => request('confListener', { id: input.id, value: input.value })
})
document.querySelectorAll('div.buttons > div').forEach(button => button.onclick = _ => request('mainListener', button.id))

const slider = document.getElementById('numberOfIcons')
slider.onclick = null
slider.addEventListener('input', _ => {
    document.getElementById('label').innerHTML = slider.value;
    request('confListener', { id: slider.id, value: parseInt(slider.value) })
});

const selection = document.getElementById('barsSelection')

function lockTrackerWindowToggle() {
    document.querySelector('label.lock > span').innerHTML = document.getElementById('lockTrackerWindow').checked ? '🔒' : '🔓'
}