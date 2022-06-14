// Import dependencies.
const { ipcRenderer } = require('electron');
const initialData = ipcRenderer.sendSync('updateConfig');
const { resolve } = require('path');

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

// When a keybind is pressed, add the icon to the list.
ipcRenderer.on('trigger', (event, param) => {

    // Push icon path.
    $ICONS.push(resolve(__dirname, `../ability-icons/${param.name.replace(/( |_)/g, '_')}.png`));

    // Filter list to match number of icons.
    if ($ICONS.length > $COUNT) while ($ICONS.length > $COUNT) $ICONS.shift();
    else if ($ICONS.length < $COUNT) while ($ICONS.length < $COUNT) $ICONS.unshift('');

    // Update cells.
    $ICONS.forEach((icon, i) => document.getElementById(`icon-${$ICONS.length - i}`).innerHTML = `<img src="${icon}">`);
})
