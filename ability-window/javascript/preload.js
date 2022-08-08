let { library, keycodes } = request('config', true);

const perks = [...library.filter(set => set.icon.includes('/perks')).filter(set => set.type === 'perks').map(n => n.name)];

const element = (perks, i) => `
    <div empty>
        <div slot>Slot ${i + 1 < 10 ? `0${i + 1}` : i + 1}</div>
        <div remove class="disable">&#x1F504;</div>
        <div abilityicon><img><img></div>
        <div name id="Ability / Item">
            <input type="text" placeholder="Ability / Item" style="border-radius: 3px;">
            <div dropdown style="display: none;"></div>
        </div>
        <div keybinds id="Keybind">
            <input type="text" placeholder="Keybind">
        </div>
        <div perkmod class="disable">
            Perks
            <div list>${perks}</div>
        </div>
        <div image class="disable">Custom Icon</div>
        <div move class="disable">Move Bind To</div>
    </div>
`;

const content = Array(16).fill(0).map((_, i) => element(perks, i)).join('')

window.onload = _ => {
    const sections = $$('main > section:not([header])');
    const tabMount = $('.tabs');
    const tabs = [{ name: 'Global', key: null }, ...config.referenceStorage.bars];

    tabs.map(bar => tabMount.innerHTML += `<div onclick="toggleTab('${bar.name}')" class="${config.barsSelection === bar.name ? 'active' : ''}" ${bar.name === 'Global' ? 'global' : ''}>${bar.name}</div>`);
    localStorage.setItem('tabs', JSON.stringify(tabs));
    tabMount.innerHTML += '<div class="add" onclick="addTab()">+</div>';
    toggleTab(config.barsSelection);

    sections.forEach(section => {
        section.innerHTML += content;
        $('[title]', section).onclick = event => {
            const isActive = section.classList.contains('active');
            sections.forEach(section => {
                $('[title]', section).classList.remove('active');
                section.classList.remove('active');
            });
            if (!isActive) {
                event.target.classList.add('active');
                section.classList.add('active');
            }
        }
    });
}


function toggleTab(bar) {
    const tabs = $$('.tabs > div');
    const activeTab = bar => $(`.tabs > div[onclick="toggleTab('${bar}')"]`);
    tabs.forEach(div => div.classList.remove('active'));
    activeTab(bar).classList.add('active');
}