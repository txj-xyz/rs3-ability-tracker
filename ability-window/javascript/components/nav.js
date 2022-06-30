if (!success) throw new Error('Component "nav" not loaded due to success failure.')

document.body.id = request('platform')
const windowTitle = `${title.slice(0, 1).toUpperCase()}${title.slice(1)} Window`
document.title = windowTitle

const nav = document.querySelector('nav')
const darwin = document.querySelector('body#darwin')
const elem = `<div window><div hide><p>-</p></div><div exit><p>X</p></div></div>`
nav.innerHTML = `${windowTitle}${darwin ? '' : elem}`

document.querySelector('div[hide]').onclick = _ => request('hide', title)
document.querySelector('div[exit]').onclick = _ => request('exit', title)