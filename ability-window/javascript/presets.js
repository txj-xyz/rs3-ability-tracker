let tabName = $('[header] [name] input')
let inactiveTabs = _ => $$('.tabs > div:not(.active)');

let currentlyEditing = {}

function addTab() {
    const tabMount = $('.tabs');
    $('.add', tabMount).remove()
    tabMount.innerHTML += '<div onclick="toggleTab(\'New Preset\', \'\')">New Preset</div>';
    $('div:last-child', tabMount).click();
    tabMount.innerHTML += '<div class="add" onclick="addTab()">+</div>';
    tabName.value = 'New Preset';
    localStorage.setItem('tabs', JSON.stringify([...JSON.parse(localStorage.getItem('tabs')), { name: 'New Preset', key: null }]))
    tabName.focus();
    tabName.select();
}

tabName.onfocus = event => {
    const editing = JSON.parse(localStorage.getItem('tabs')).find(tab => tab.name === event.target.value)
    currentlyEditing.name = editing.name
    currentlyEditing.key = editing.key
    event.target.select()
}

tabName.onblur = event => {
    if (currentlyEditing.name) {
        const activeTab = _ => $('.tabs > div.active');
        let cache = JSON.parse(localStorage.getItem('tabs'));
        cache = cache.filter(tab => tab.name !== currentlyEditing.name);
        if (!event.target.value) event.target.value = 'Unnamed Tab';
        cache.push({ name: event.target.value, key: $('[header] [keybinds] input').value.length ? $('[header] [keybinds] input').value : null });
        activeTab().setAttribute('onclick', `toggleTab('${event.target.value}', '${currentlyEditing.key ?? ''}')`);
        activeTab().innerHTML = event.target.value;
        localStorage.setItem('tabs', JSON.stringify(cache));
        currentlyEditing.name = null;
        currentlyEditing.key = null;
    }
}

tabName.onkeyup = event => $('.tabs div.active').innerHTML = event.target.value;

function popup() {
    const activeTab = _ => $('.tabs > div.active');
    $('[popup]').style.display = 'block';
    $('[popup] p').innerHTML = `Are you sure you want to delete ${activeTab().innerHTML}? This will remove X binds.`;
}

function confirm() {
    const activeTab = _ => $('.tabs > div.active');
    const cache = JSON.parse(localStorage.getItem('tabs'));
    cache.splice(cache.findIndex(tab => tab.name === activeTab().innerHTML), 1);
    localStorage.setItem('tabs', JSON.stringify(cache));
    activeTab().remove();
    $('.tabs > div').click();
    $('[popup]').style.display = 'none';
}