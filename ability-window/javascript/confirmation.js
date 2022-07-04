document.querySelector('div[confirm]').onclick = _ => {
    request('confirmationListener', true)
}

document.querySelector('div[deny]').onclick = _ => {
    request('confirmationListener', false)
}