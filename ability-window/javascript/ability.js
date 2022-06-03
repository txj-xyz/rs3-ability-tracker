// Import dependencies.
const { ipcRenderer } = require('electron');
const initialData = ipcRenderer.sendSync('updateConfig');

// Declare global count variable.
let $COUNT = initialData.numberOfIcons;
const $ICONS = [];

// Initial load of cells.
const main = document.querySelector('main');
for (let i = $COUNT; i > 0; i--) main.innerHTML += `<div style="width:calc(100% / ${$COUNT})" id="icon-${i}"><div></div></div>`;

// Update cells instead of reloading content.
const refresh = param => {

    // If new number of icons is greater than current number of icons, add cells.
    if (param > $COUNT) {
        for (let i = 0; i < param - $COUNT; i++) {
            const div = document.createElement('div');
            div.innerHTML = '<div></div>';
            main.insertBefore(div, main.childNodes[0]);
        }
    }

    // If new number of icons is less than current number of icons, remove cells.
    else {
        for (let i = 0; i < $COUNT - param; i++) {
            const node = document.getElementById([...document.querySelectorAll('main > div')][0].id);
            node.parentNode.removeChild(node);
            $ICONS.shift()
        }
    }

    // Update element IDs.
    let i = $COUNT = param;
    document.querySelectorAll('main > div').forEach(div => {
        div.style.width = `calc(100% / ${param})`;
        div.id = `icon-${i}`;
        i--;
    })
}

// Backend trigger to update number of icons.
ipcRenderer.on('refresh', (event, param) => refresh(param));

ipcRenderer.on('trigger', (event, param) => {
    $ICONS.push(`../ability-icons/${param.ability}.png`);
    if ($ICONS.length > $COUNT) while ($ICONS.length > $COUNT) $ICONS.shift();
    else if ($ICONS.length < $COUNT) while ($ICONS.length < $COUNT) $ICONS.unshift('');
    $ICONS.forEach((icon, i) => document.getElementById(`icon-${$ICONS.length - i}`).innerHTML = `<img src="${icon}">`);
})