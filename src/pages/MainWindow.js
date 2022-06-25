const Window = require('../base/Window.js');

module.exports = class Main extends Window {
    constructor() {
        super()
            .create({ ...windows.properties, width: 700, height: 190 }, true)
            .ipcLoader(this.mainListener, this.confListener)
        // if (!config.referenceStorage.keybinds.length) new Keybinds()
        // else windows.main.on('ready-to-show', _ => new Main())
    }

    mainListener = (event, param) => {
        switch (param) {
            case 'quit': { quitHandler(); break; }
        }
        return event.returnValue = null;
    }

    confListener = (event, param) => {
        if(typeof config[param] === 'boolean') {
            config[param] = !config[param]
        }
        else {}

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
    }
}
