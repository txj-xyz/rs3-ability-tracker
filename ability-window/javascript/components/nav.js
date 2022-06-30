if (!success) throw new Error('Component "nav" not loaded due to success failure.')

document.body.id = request('platform')
const windowTitle = `${title.slice(0, 1).toUpperCase()}${title.slice(1)} Window`
document.title = windowTitle

const nav = document.querySelector('nav')
const darwin = document.querySelector('body#darwin')
const elem = `<div window><div hide><p>-</p></div><div exit><p>X</p></div></div>`
nav.innerHTML = `${windowTitle}${darwin ? '' : elem}`

const [hide, exit] = [document.querySelector('div[hide]'), document.querySelector('div[exit]')]

if (hide) hide.onclick = _ => request('hide', title)
if (exit) exit.onclick = _ => request('exit', title)

ipc.on('closed', (event, param) => console.log(param))