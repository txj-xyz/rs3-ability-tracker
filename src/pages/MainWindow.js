const { windows, __userData } = require('../base/Manager');

const [{ dialog, shell }, Window, { resolve, join }, { writeFileSync, readFileSync }] = ['electron', '../base/Window.js', 'node:path', 'node:fs'].map(require);

module.exports = class Main extends Window {
    constructor() {
        super()
            .create({ ...windows.properties, width: 250, height: 394 }, true)
            .ipcLoader(this.mainListener, this.confListener);
        // windows.main?.setAlwaysOnTop(true);
        windows.update?.focus();
        windows.main?.isVisible() ? windows.main?.show() : void 0;
    }

    mainListener = (event, param) => {
        if (param === 'quit') quitHandler();
        else if (param === 'ability' && !windows.ability) new Confirmation();
        else if (param === 'ability' && windows.ability) windows.ability.close();
        else if (param === 'import' || param === 'export') this.presetManager(event, param);
        else if (param === 'open') {
            shell.openPath(__folder('custom-images'));
        }
        else new global[param.slice(0, 1).toUpperCase() + param.slice(1)]();
        return (event.returnValue = null);
    };

    presetManager = async (event, param) => {
        switch (param) {
            case 'import':
                const _importPath = await dialog.showOpenDialog(null, { filters: [{ name: 'Ability Tracker Config', extensions: ['tconfig'] }], title: 'Import Configuration File' });
                if (!_importPath.canceled) {
                    try {
                        const _importedPath = _importPath.filePaths[0];
                        const _importedConfig = readFileSync(resolve(_importedPath), 'utf8');
                        const _importedConverted = new Buffer.from(_importedConfig, 'base64').toString();
                        const _importedData = JSON.parse(_importedConverted);
                        if (!['keybinds', 'bars'].map(e => _importedData.hasOwnProperty(e)).includes(false)) {
                            config.referenceStorage = _importedData;
                            windows.main?.webContents.send('presetManager', { message: 'import', data: _importedData, name: _importedPath });
                        } else windows.main?.webContents.send('presetManager', { message: 'failed_import' });
                        event.returnValue = null;
                    } catch (error) {
                        // TODO: Add a message to pass over
                        windows.main?.webContents.send('presetManager', { message: 'failed_import', error: error.message });
                        event.returnValue = null;
                    }
                }
                break;

            case 'export':
                const _exportPath = await dialog.showSaveDialog(null, { filters: [{ name: 'Ability Tracker Config', extensions: ['tconfig'] }], title: 'Export Configuration File' });
                if (!_exportPath.canceled) {
                    try {
                        writeFileSync(resolve(_exportPath.filePath), new Buffer.from(JSON.stringify(config.referenceStorage)).toString('base64'));
                        windows.main?.webContents.send('presetManager', { message: 'export', path: resolve(_exportPath.filePath) });
                        event.returnValue = null;
                    } catch (error) {
                        // TODO: Add a message to pass over
                        windows.main?.webContents.send('presetManager', { message: 'failed_export', error: error.message });
                        event.returnValue = null;
                    }
                }
                event.returnValue = null;
                break;
        }
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
                windows.ability?.setAspectRatio(config.numberOfIcons);
                let _bounds = windows.ability?.getBounds();
                _bounds ? (config.abilityWindow = windows.ability?.getBounds()) : void 0;
                windows.ability?.setSize(config.abilityWindow.height * config.numberOfIcons, config.abilityWindow.height);
                windows.ability?.webContents.send('updateView', config.numberOfIcons);
                break;
            }
        }
        event.returnValue = null;
    };
};
