const { resolve } = require('path');
let [__count, __icons] = [config.numberOfIcons, []];

const main = document.querySelector('main');
for (let i = __count; i > 0; i--) main.innerHTML += `<div style="width:calc(100% / ${__count})" id="icon-${i}"><div></div></div>`;


ipc.on('updateView', (event, param) => {
    if (param > __count) {
        for (let i = 0; i < param - __count; i++) {
            const div = document.createElement('div');
            div.innerHTML = '<div></div>';
            main.insertBefore(div, main.childNodes[0]);
        }
    } else {
        for (let i = 0; i < __count - param; i++) {
            const node = document.getElementById([...document.querySelectorAll('main > div')][0].id);
            node.parentNode.removeChild(node);
            __icons.shift();
        }
    }

    let i = __count = param;
    document.querySelectorAll('main > div').forEach(div => {
        div.style.width = `calc(100% / ${param})`;
        div.id = `icon-${i}`;
        i--;
    })
})

ipc.on('abilityData', (event, param) => {
    __icons.push({ icon: resolve(__dirname, param.icon), perk: param.perk ? resolve(__dirname, param.perk) : null });
    if (__icons.length > __count) while (__icons.length > __count) __icons.shift();
    else if (__icons.length < __count) while (__icons.length < __count) __icons.unshift('');
    __icons.forEach((set, i) => document.getElementById(`icon-${__icons.length - i}`).innerHTML = set ? `<img src="${set.icon}" />${set.perk !== 'undefined' ? `<img src="${set.perk}" />` : ''}` : '');
})
