let { library, keycodes } = request('config', true);

const perks = [...library.filter(set => set.icon.includes('/perks')).filter(set => set.type === 'perks').map(n => n.name)];

const element = (perks, i) => `
    <div empty>
        <div slot>Slot ${i + 1 < 10 ? `0${i + 1}` : i + 1}</div>
        <div remove class="disable">&#x1F504;</div>
        <div abilityicon><img><img></div>
        <div name id="Ability / Item">
            <input type="text" placeholder="" style="border-radius: 3px;">
            <div dropdown style="display: none;"></div>
        </div>
        <div keybinds id="Keybind">
            <input type="text" placeholder="">
        </div>
        <div perkmod class="disable">
            Perks
            <div list>${perks}</div>
        </div>
        <div image class="disable">Custom Icon</div>
        <div move>Move Bind To</div>
    </div>
`;

const content = Array(16).fill(0).map((_, i) => element(perks, i))

window.onload = _ => {
    const sections = $$('main > section:not([header]):not([globalOnly])');
    const keyName = $('[header] [keybinds] input')
    const tabMount = $('.tabs');
    const globalSec = $('[globalOnly]');
    const tabs = [{ name: 'Global', key: null }, ...config.referenceStorage.bars];

    globalSec.innerHTML = Array(3).fill(0).map((_, i) => element(perks, i)).join('')

    tabs.map(bar => tabMount.innerHTML += `<div onclick="toggleTab('${bar.name}', '${bar.key ?? ''}')" class="${config.barsSelection === bar.name ? 'active' : ''}" ${bar.name === 'Global' ? 'global' : ''}>${bar.name}</div>`);
    localStorage.setItem('tabs', JSON.stringify(tabs));
    tabMount.innerHTML += '<div class="add" onclick="addTab()">+</div>';
    toggleTab(config.barsSelection, tabs.find(bar => bar.name === config.barsSelection).key);

    sections.forEach(section => {
        section.innerHTML += content.join('');
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

    new Keybind(keyName)
}


function toggleTab(bar, key) {
    const tabName = $('[header] [name] input')
    const keyName = $('[header] [keybinds] input')
    const main = $('main')
    const sections = $$('main > section:not([header]):not([globalOnly])');
    const tabs = $$('.tabs > div');
    const activeTab = bar => $(`.tabs > div[onclick="toggleTab('${bar}', '${key ?? ''}')"]`);
    tabs.forEach(div => div.classList.remove('active'));
    activeTab(bar).classList.add('active');
    tabName.value = bar;
    keyName.value = key ?? '';
    if (bar === 'Global') {
        main.classList.add('global')
    } else {
        main.classList.remove('global')
    }
    sections.forEach(section => {
        $('[title]', section).classList.remove('active');
        section.classList.remove('active');
    });
}