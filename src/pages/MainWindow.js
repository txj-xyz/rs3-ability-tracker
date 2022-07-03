const Window = require('../base/Window.js');

module.exports = class Main extends Window {
    constructor() {
        super()
            .create({ ...windows.properties, width: 250, height: 385 })
            .ipcLoader(this.mainListener, this.confListener)
        new Keybinds()
    }

    mainListener = (event, param) => {
        if (param === 'quit') quitHandler()
        else new global[param.slice(0, 1).toUpperCase() + param.slice(1)]()
        return event.returnValue = null;
    }

    confListener = (event, param) => {
        Reflect.set(config, param.id, typeof config[param.id] === 'boolean' ? !config[param.id] : param.value)

        switch (param) {
            case 'trackCooldowns': {
                // if (!config.trackCooldowns) unregisterCooldowns(); Finish on UnregisterManager creation
                break;
            }
            case 'lockTrackerWindow': {
                // windows.ability?.setMovable(!config.lockTrackerWindow);
                // windows.ability?.setResizable(!config.lockTrackerWindow);
                break;
            }

            default:
                break;
        }
        event.returnValue = null
    }
}
