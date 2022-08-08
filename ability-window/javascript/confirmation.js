$('div[confirm]').onclick = _ => {
    request('confirmationListener', true)
}

$('div[deny]').onclick = _ => {
    request('confirmationListener', false)
}