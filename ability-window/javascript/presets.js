let currentlyEditing = null;

function addTab() {
    const tabMount = $('.tabs');
    $('.add', tabMount).remove()
    tabMount.innerHTML += '<div onclick="toggleTab(\'New Preset\')">New Preset</div>';
    $('div:last-child', tabMount).click();
    tabMount.innerHTML += '<div class="add" onclick="addTab()">+</div>';
    $('[header] [name] input').value = 'New Preset';
    localStorage.setItem('tabs', JSON.stringify([...JSON.parse(localStorage.getItem('tabs')), { name: 'New Preset', key: null }]))
}

$('[header] [name] input').onfocus = event => {
    currentlyEditing = JSON.parse(localStorage.getItem('tabs')).find(tab => tab.name === event.target.value)
}

$('[header] [name] input').onblur = event => {
    if (currentlyEditing && currentlyEditing.name !== event.target.value) {
        let cache = JSON.parse(localStorage.getItem('tabs'));
        cache = cache.filter(tab => tab.name !== currentlyEditing.name);
        cache.push({ name: event.target.value, key: $('[header] [keybinds] input').value.length ? $('[header] [keybinds] input').value : null });
        localStorage.setItem('tabs', JSON.stringify(cache));
        currentlyEditing = null
    }
}

$('[header] [name] input').onkeyup = event => {
    $('.tabs div.active').innerHTML = event.target.value
}