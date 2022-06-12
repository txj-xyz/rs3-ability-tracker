// Import dependencies.
const { ipcRenderer } = require('electron');

// Request data from backend.
const config = ipcRenderer.sendSync('config');

// Random ID generator.
const randomID = (sections, phrase, join, random = a => a[Math.floor(Math.random() * a.length)]) =>
    [...Array(sections)]
        .map(_ =>
            [...Array(phrase)]
                .map(_ => random([...[...Array(26)].map((_, i) => String.fromCharCode(i + 65)), ...[...Array(26)].map((_, i) => String.fromCharCode(i + 65).toLowerCase()), ...[...Array(10).keys()]]))
                .join('')
        )
        .join(join ?? '-');

let [saveToggle, editToggle] = [false, false];

// Default data.
const [bar, buttons, notice] = [
    '<div id="ID" GLBLDISABLE><div onclick="remove(\'ID\')" style="background:#F04747" remove>-</div><div id="Bar Name" bar DISABLED><input type="text" placeholder="Bar Name" value="BARNAME" /></div><div onclick="edit(\'ID\')" style="background:#FAA61A; DISPLAY" edit>Edit</div><p data-after="MULTIPLE">COUNT</p></div>',
    '<div manage><div onclick="copy()" style="background:#00A9FF" button>+ New Bar</div><div onclick="save()" button save>Save</div></div>',
    "<div mount><p>Are you sure you want to remove the BARNAME bar?</p><hr /><p>Doing so will delete COUNT binds.</p><div><div style=\"background:#F04747\" onclick=\"const div = document.getElementById('ID');div.parentNode.removeChild(div); document.querySelector('div[popup] div[button]:last-child').click(); ipcRenderer.sendSync('config', 'EDIT')\" button>Confirm</div><div style=\"background:#00A9FF\" onclick=\"const popup = document.querySelector('div[popup]');popup.style.transform = 'scale(0.7)';popup.style.opacity = 0;popup.style.pointerEvents = 'none';\" button>Cancel</div></div></div >",
];

// Toggle save button.
const toggle = _ => {
    saveToggle = !saveToggle;
    const element = document.querySelector('div[save]');
    element.style.background = saveToggle ? '#43B581' : 'var(--elements)';
};

// Action for remove button.
const remove = (id, div = document.getElementById(id)) => {
    if (parseInt(div.querySelector('p').innerHTML) > 3) popup(id, Array.isArray(editToggle) && editToggle[0] === id ? editToggle[1] : null);
    else {
        ipcRenderer.sendSync('config', (Array.isArray(editToggle) && editToggle[0] === id ? editToggle[1] : div.querySelector('input').value).toLowerCase());
        div.parentNode.removeChild(div);
    }

    // Update save button.
    saveToggle ? toggle() : void 0;
    sendBars();
};

// Show popup.
function popup(id, edit) {
    const bar = document.getElementById(id);
    let field = notice
        .replace(/COUNT/g, bar.querySelector('p').innerHTML)
        .replace(/BARNAME/g, bar.querySelector('input').value)
        .replace(/ID/g, id)
        .replace(/EDIT/g, (edit || bar.querySelector('input').value).toLowerCase());
    const popup = document.querySelector('div[popup]');
    popup.innerHTML = field;
    popup.style.transform = 'scale(1)';
    popup.style.opacity = 1;
    popup.style.pointerEvents = 'auto';
}

// Send removed bar to backend.
function filter(bar, edit) {
    ipcRenderer.sendSync('config', (edit || bar).toLowerCase());
}

// Action for edit button.
const edit = (id, div = document.getElementById(id)) => {
    const add = document.querySelector('div[manage] > div[button]:first-child');

    // If the bar is not being edited.
    if (div.querySelector('input').value === editToggle[1] && editToggle[0] === id) reset();
    // If the bar is being edited and user wants a reset.
    else if (Array.isArray(editToggle) && editToggle.some(e => e) && editToggle[0] === id) reset(true);
    // If a bar is being edited, and the user wants to edit another bar.
    else if (Array.isArray(editToggle) && editToggle.some(e => e)) notify('Save or cancel your current changes.', true);
    else {
        // Show the edit field.
        div.querySelector('div[edit]').innerHTML = 'Cancel';
        div.querySelector('div[bar]').removeAttribute('disabled');
        add.setAttribute('disabled', '');
        saveToggle ? toggle() : void 0;
        editToggle = [id, div.querySelector('input').value];
    }

    // Reset the edit toggle.
    function reset(revert) {
        // If true then reset the data within the bar.
        if (revert) div.querySelector('input').value = editToggle[1];
        div.querySelector('div[edit]').innerHTML = 'Edit';
        div.querySelector('div[bar]').setAttribute('disabled', '');
        add.removeAttribute('disabled');
        editToggle = false;
    }
};

// Create new bar input.
function copy(name, count, read, initial) {
    // If a bar is being edited, do not allow new bars to be created.
    if (Array.isArray(editToggle) && editToggle.some(e => e)) return;

    let field;

    // Declare varibales.
    const [id, btns] = [randomID(5, 5), document.querySelector('div[manage]')];

    // Remove more stuff if bar is global.
    if (name === 'Global')
        field = bar
            .replace(/(onclick="remove(.*?)"|id="ID")/g, '')
            .replace(/Bar Name"/, '(Non-switching)" class="fixed"')
            .replace(/GLBLDISABLE/g, 'disabled');

    // Update values for bars.
    field = (field || bar)
        .replace(/MULTIPLE/g, `linked bind${count === 1 ? '' : 's'}`)
        .replace(/ID/g, id)
        .replace(/BARNAME/g, name || '')
        .replace(/COUNT/g, count?.toLocaleString() || 0)
        .replace(/GLBLDISABLE/g, '')
        .replace(/DISABLED/g, read && name !== 'Global' ? 'disabled' : '')
        .replace(/DISPLAY/g, !read ? 'opacity:0;pointer-events:none' : '');

    // Remove buttons.
    btns.parentNode.removeChild(btns);

    // Add new element and buttons.
    document.querySelector('div[keys]').insertAdjacentHTML('beforeend', field + buttons);

    // Add listeners to all divs except global.
    if (name !== 'Global') {
        const input = document.getElementById(id).querySelector('input');
        input.addEventListener('change', _ => (saveToggle ? toggle() : void 0));
        input.addEventListener('focus', _ => {
            input.select();
            input.parentNode.classList.contains('error') ? input.parentNode.classList.remove('error') : void 0;
        });
    }

    // Do not scoll to top on window open.
    if (!initial) window.scrollTo(0, document.body.scrollHeight);
}

// Window load initial setup.
let bars = { Global: 0 };
config.referenceStorage.bars.map(bar => (bars[bar] = 0));
config.referenceStorage.keybinds.map(e => {
    for (let bar in bars) if (bar.toLowerCase() === e.bar.toLowerCase()) return bars[bar]++;
});

copy('Global', bars.Global, true, true);
delete bars.Global;

for (const bar in bars) copy(bar, bars[bar], true, true);
if (config.referenceStorage.bars.length) toggle();

// Notification triggers.
function notify(msg, failed) {
    const id = randomID(5, 5);
    let [notification, parent] = [document.createElement('div'), document.querySelector('div[notify]')];

    // Notification properties.
    if (failed) notification.classList.add('failed');
    notification.id = id;
    notification.innerHTML = `<div onclick="removeNotif('${id}')">x</div>${msg}`;
    parent.insertBefore(notification, parent.childNodes[0]);

    // Notification timeout case.
    setTimeout(_ => {
        if (!notification.classList.contains('deleted')) notification?.classList?.add('deleted');
        setTimeout(_ => notification.parentNode.removeChild(notification), 490);
    }, 4000);
}

// Remove notification.
const removeNotif = id => document.getElementById(id)?.classList?.add('deleted');

// Save data and update config.
function save() {
    let failed = false;

    // If only one element is being updated.
    if (editToggle) {
        config.referenceStorage.keybinds.map(e => (e.bar === editToggle[1] ? (e.bar = document.getElementById(editToggle[0]).querySelector('input').value) : void 0));
        config.referenceStorage.bars = [...config.referenceStorage.bars.filter(e => e !== editToggle[1]), document.getElementById(editToggle[0]).querySelector('input').value];
    }

    // If all the elements are being updated.
    else {
        const [bars, binds] = [document.querySelectorAll('div[keys] > div[id]'), []];
        bars.forEach(e => {
            const bar = e.querySelector('input').value;
            if (!bar) {
                failed = true;
                if (!bar) e.querySelector('div[bar]').classList.add('error');
                return notify('Missing value.', true);
            } else if (binds.includes(bar)) {
                failed = true;
                e.querySelector('div[bar]').classList.add('error');
                return notify('Bar already exists.', true);
            }
            binds.push(bar);
        });
        config.referenceStorage.bars = binds;
    }

    if (failed) return;

    // Send data to backend.
    ipcRenderer.sendSync('config', config.referenceStorage.bars);

    // Send a notification to the user.
    !saveToggle ? notify('Bars updated successfully!') : void 0;

    // Set save button background.
    !saveToggle ? toggle() : void 0;

    editToggle = false;

    // Reset buttons.
    document.querySelectorAll('div[keys] > div[id]').forEach(e => {
        const edit = e.querySelector('div[edit]');
        edit.innerHTML = 'Edit';
        edit.style.opacity = 1;
        edit.style.pointerEvents = 'auto';
        if (!e.querySelector('div[bar]').hasAttribute('disabled')) e.querySelector('div[bar]').setAttribute('disabled', '');
        document.querySelector('div[manage] > div[button]:first-child').removeAttribute('disabled');
    });
}

// Incoming data handler.
ipcRenderer.on('passToBars', (e, data) => {
    let bars = { global: 0 };
    config.referenceStorage.bars.map(bar => (bars[bar.toLowerCase()] = 0));
    data.map(e => bars[e.toLowerCase()]++);

    const elements = document.querySelectorAll('div[keys] > div[id]');
    const global = document.querySelector('div[disabled]').querySelector('p');

    // Update bar counts.
    global.innerHTML = bars.global.toLocaleString();
    global.setAttribute('data-after', `linked bind${bars.global === 1 ? '' : 's'}`);
    elements.forEach(e => {
        const [bar, value] = [e.querySelector('p'), bars[e.querySelector('input').value.toLowerCase()]];
        bar.innerHTML = value.toLocaleString();
        bar.setAttribute('data-after', `linked bind${value === 1 ? '' : 's'}`);
    });
});

// Send bar info to backend.
function sendBars() {
    const [bars, data] = [document.querySelectorAll('div[keys] input'), []];
    bars.forEach(bar => data.push(bar.value));
    ipcRenderer.sendSync('passToKeys', data);
}
