const Window = require('../base/Window.js');

module.exports = class Main extends Window {
    constructor() {
        super()
            .create({ ...windows.properties, width: 250, height: 385 })
            .ipcLoader(this.mainListener, this.confListener)
    }

    mainListener = (event, param) => {
        if (param === 'quit') quitHandler()
        else new global[param.slice(0, 1).toUpperCase() + param.slice(1)]()
        return event.returnValue = null;
    }

    confListener = (event, param) => {
        Reflect.set(config, param.id, typeof config[param.id] === 'boolean' ? !config[param.id] : param.value)

        switch (param.id) {
            case 'trackCooldowns': {
                // if (!config.trackCooldowns) unregisterCooldowns(); Finish on UnregisterManager creation
                break;
            }
            case 'lockTrackerWindow': {
                windows.ability?.setMovable(!config.lockTrackerWindow);
                windows.ability?.setResizable(!config.lockTrackerWindow);
                break;
            }

            case 'numberOfIcons': {
                config.abilityWindow.width = config.abilityWindow.height * config.numberOfIcons;
                windows.ability.setSize(config.abilityWindow.width, config.abilityWindow.height);
                windows.ability?.setAspectRatio((config.abilityWindow.height * config.numberOfIcons) / config.abilityWindow.height);
                windows.ability?.webContents.send('updateView', config.numberOfIcons);
                break;
            }
        }
        event.returnValue = null
    }
}
