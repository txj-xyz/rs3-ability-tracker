let { library, keycodes } = request('config', true);
//Library is a map of game-key-dada
const perks = [...library.filter(set => set.icon.includes('/perks')).filter(set => set.type === 'perks').map(n => n.name)];
//Libary > items that have an icon that includes 'perks' > of those items the set type is 'perks' > map that data and take the name of each of the perks.
//I.e. Carooming, flanking, lunging and planted feet
//Tldr gets a list of all the perks by name.
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
//Creates a menu for selecting perks for a slot.
//This is in preset window.
//i.e.

    // <div empty>
    //     <div slot>Slot 01</div>
    //     <div remove class="disable">&#x1F504;</div>
    //     <div abilityicon><img><img></div>
    //     <div name id="Ability / Item">
    //         <input type="text" placeholder="" style="border-radius: 3px;">
    //         <div dropdown style="display: none;"></div>
    //     </div>
    //     <div keybinds id="Keybind">
    //         <input type="text" placeholder="">
    //     </div>
    //     <div perkmod class="disable">
    //         Perks
    //         <div list>Caroming Perk,Flanking Perk,Lunging Perk,Planted Feet</div>
    //     </div>
    //     <div image class="disable">Custom Icon</div>
    //     <div move>Move Bind To</div>
    // </div>

const content = Array(16).fill(0).map((_, i) => element(perks, i))
console.log(content.toString());
//This calls elemnt(perks, i) and creates an array of 16 elements starting with 01 and ending with 16
window.onload = _ => {
    //When the window loads
    const sections = $$('main > section:not([header]):not([globalOnly])');
    //Geting sections whose id is not header nor globalOnly
    const keyName = $('[header] [keybinds] input')
    //Taking the input from 'header' and 'keybinds'
    const tabMount = $('.tabs');
    //Parent divider for tabs
    const globalSec = $('[globalOnly]');
    //Getting element by id 'globalOnly'
    const tabs = [{ name: 'Global', key: null }, ...config.referenceStorage.bars];
    //Getting bar tabs.

    globalSec.innerHTML = Array(3).fill(0).map((_, i) => element(perks, i)).join('')
    //This is creating the 'Global' Area on 'Presets' window.

    tabs.map(bar => tabMount.innerHTML += `<div onclick="toggleTab('${bar.name}', '${bar.key ?? ''}')" class="${config.barsSelection === bar.name ? 'active' : ''}" ${bar.name === 'Global' ? 'global' : ''}>${bar.name}</div>`);
    //Laying out the tabs for you to select from.

    localStorage.setItem('tabs', JSON.stringify(tabs));

    tabMount.innerHTML += '<div class="add" onclick="addTab()">+</div>';
    //Adding a "add" tab button.
    toggleTab(config.barsSelection, tabs.find(bar => bar.name === config.barsSelection).key);
    //Selecting the tab.
    sections.forEach(section => {
        console.log(section.innerHTML+"This is inner.")
        section.innerHTML += content.join('');
        console.log(section.innerHTML+"This is inner.")
        $('[title]', section).onclick = event => {
            //Looking for element by title, on click >
            const isActive = section.classList.contains('active');
            //Checking to see if it is active
            sections.forEach(section => {
                $('[title]', section).classList.remove('active');
                section.classList.remove('active');
                //Removing all active sessions
            });
            if (!isActive) {
                //If it is not active
                event.target.classList.add('active');
                section.classList.add('active');
                //Add the active tag.
            }
        }
    });

    new Keybind(keyName)
    //Create a new keybind from the input of 'header' and 'keybinds'
}


function toggleTab(bar, key) {
    //to toggle tab
    const tabName = $('[header] [name] input')
    const keyName = $('[header] [keybinds] input')
    const main = $('main')
    const sections = $$('main > section:not([header]):not([globalOnly])');
    const tabs = $$('.tabs > div');
    //Same stuff as above
    const activeTab = bar => $(`.tabs > div[onclick="toggleTab('${bar}', '${key ?? ''}')"]`);
    //Finding the tab.
    tabs.forEach(div => div.classList.remove('active'));
    //Removing all active.
    activeTab(bar).classList.add('active');
    //Adding an active bar
    tabName.value = bar;
    //Set the tab name to bar name
    keyName.value = key ?? '';
    //No clue LOL
    if (bar === 'Global') {
        main.classList.add('global')
        //if bar is global, then add global
    } else {
        main.classList.remove('global')
        //if bar is not global, remove global
    }
    sections.forEach(section => {
        $('[title]', section).classList.remove('active');
        section.classList.remove('active');
        //For each element with id title, remove active.
    });
}