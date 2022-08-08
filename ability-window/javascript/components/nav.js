document.body.id = request('platform')
const windowTitle = `${title.slice(0, 1).toUpperCase()}${title.slice(1)} Window`
document.title = windowTitle

const nav = $('nav')
const darwin = $('body#darwin')
const elem = this.title !== 'confirmation' ? `<div window><div hide><p>-</p></div><div exit><p>X</p></div></div>` : ''
if (nav) nav.innerHTML = `${windowTitle}${darwin ? '' : elem}`

const [hide, exit] = [$('div[hide]'), $('div[exit]')]

if (hide) hide.onclick = _ => request('hide', title)
if (exit) exit.onclick = _ => request('exit', title)