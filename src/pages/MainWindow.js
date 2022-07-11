const { windows, store } = require('../base/Manager.js');
const Window = require('../base/Window.js');

module.exports = class Main extends Window {
    constructor() {
        super()
            .create({ ...windows.properties, width: 250, height: 358 }, true)
            .ipcLoader(this.mainListener, this.confListener);
        windows.update?.focus();
    }

    mainListener = (event, param) => {
        if (param === 'quit') quitHandler();
        else if (param === 'ability' && !windows.ability) new Ability();
        else if (param === 'ability' && windows.ability) windows.ability.close();
        else new global[param.slice(0, 1).toUpperCase() + param.slice(1)]();
        return (event.returnValue = null);
    };

    confListener = (event, param) => {
        Reflect.set(config, param.id, typeof config[param.id] === 'boolean' ? !config[param.id] : param.value);

        switch (param.id) {
            case 'lockTrackerWindow': {
                windows.ability?.setMovable(!config.lockTrackerWindow);
                windows.ability?.setResizable(!config.lockTrackerWindow);
                break;
            }

            case 'barsSelection': {
                if (windows.ability) {
                    unregister();
                    new Trigger();
                }
                break;
            }

            case 'numberOfIcons': {
                if (config.lockTrackerWindow) {
                    config.abilityWindow.width = config.abilityWindow.height * config.numberOfIcons;
                    windows.ability?.setResizable(true);
                    windows.ability?.setSize(config.abilityWindow.height * config.numberOfIcons, config.abilityWindow.height);
                    windows.ability?.setResizable(!config.lockTrackerWindow);
                }

                windows.ability?.setAspectRatio(config.numberOfIcons);
                let _bounds = windows.ability?.getBounds();
                _bounds ? (config.abilityWindow = windows.ability?.getBounds()) : void 0;
                windows.ability?.webContents.send('updateView', config.numberOfIcons);
                break;
            }
        }
        event.returnValue = null;
    };
};
