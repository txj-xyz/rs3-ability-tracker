const Window = require('../base/Window.js')

module.exports = class Main extends Window {
    constructor() {
        super()
        super.give(this)
        if (!super.instanceCheck()) super.create({ ...windows.properties, width: 700, height: 190, show: true })
        new Taskbar()
    }
}
