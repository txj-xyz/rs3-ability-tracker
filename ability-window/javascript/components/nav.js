if (!success) throw new Error('Component "nav" not loaded due to success failure.')

const nav = document.querySelector('nav')
nav.innerHTML = `${this.name.slice(0, 1).toUpperCase()}${this.name.slice(1)} Window`

document.body.id = request('platform')
