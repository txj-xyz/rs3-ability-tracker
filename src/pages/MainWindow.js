const { windows, __userData } = require('../base/Manager');

const [{ dialog, shell }, Window, { resolve, join }, { writeFileSync, readFileSync }] = ['electron', '../base/Window.js', 'node:path', 'node:fs'].map(require);

module.exports = class Main extends Window {
    //Constructor to the Frontend. Defined the windows themselves.
    //Window Initilization
    constructor() {
        super()
            .create({ ...windows.properties, width: 250, height: 394 }, true)
            .ipcLoader(this.mainListener, this.confListener);  
            //ipcLoader adds "function listeners" to the frontend. The bridge between renderer <---> electron
        // windows.main?.setAlwaysOnTop(true);
        windows.update?.focus();
        windows.main?.isVisible() ? windows.main?.show() : void 0;
    }
    //Changing Windows
    mainListener = (event, param) => {
        //Function listener called from ipcLoader. Param being frontend input.
        //Param being frontend > electron backend communication
        //Param can be anythign sent from the front end.
        //Event > electron internal event call. 
        if (param === 'quit') quitHandler();
        //If quit > call quitHandler
        else if (param === 'ability' && !windows.ability) new Confirmation(); 
        //If param is ability and window is not ability > Make a new confirmation window
        else if (param === 'ability' && windows.ability) windows.ability.close(); 
        //If param is ability and window is ability > Close Ability Window
        else if (param === 'import' || param === 'export') this.presetManager(event, param); 
        // If param  is input or export > run function presetManager
        else if (param === 'open') shell.openPath(__folder('custom-images'));
        //if param is "open", open the custom-images folder. I cant find the source fo rthis, but I assume its just a folder for a custom item
        else new global[param.slice(0, 1).toUpperCase() + param.slice(1)]();
        //Creating a calling prior made class. Only used for presets.
        return (event.returnValue = null);
        //stops electron from waiting for a returned value from the event itself, meaning it returns null no matter what and the thread is not stopped
        //Return value by default in undefined. Is a breakpoint.
    };

    presetManager = async (event, param) => {
        //This is activated when the param is either import or export
        switch (param) {
            //Comparative earesion. Case shows a certain clause while Break ends the clause expression.
            case 'import'://If param is import
                const _importPath = await dialog.showOpenDialog(null, { filters: [{ name: 'Ability Tracker Config', extensions: ['tconfig'] }], title: 'Import Configuration File' });
                //dialouge.showOpenDialouge has two function params inside of it. title and filters. Filters filtering by name and extension. This returns the native system dialouges for the selected files.     
                if (!_importPath.canceled) {
                    //If the dialouge is not cancled > There is somethign in the filePaths[] array.
                    try {
                        const _importedPath = _importPath.filePaths[0]; 
                        //Getting the first filepath from the FilePaths array.
                        const _importedConfig = readFileSync(resolve(_importedPath), 'utf8');
                         //Read _importedPath and return its contents in utf8 format
                        const _importedConverted = new Buffer.from(_importedConfig, 'base64').toString();
                        //Takes _importedConfig and converst it to base64 format
                        const _importedData = JSON.parse(_importedConverted);
                        //Converts the file data from a JSON to a String
                        if (!['keybinds', 'bars'].map(e => _importedData.hasOwnProperty(e)).includes(false)) {
                            //Creates an interator that checks to see if Imported Data properties 'keybinds' and 'bars' dont exsist.
                            config.referenceStorage = _importedData;
                            //Replaced save data with new data.
                            //'presetManager' id of the event.
                            windows.main?.webContents.send('presetManager', { message: 'import', data: _importedData, name: _importedPath });
                            //Send a webcontent message to "main" window. Message "import" with parsed Data and FilePath
                        } else windows.main?.webContents.send('presetManager', { message: 'failed_import' });
                        //Send a webcontent message to "main" window. Message "failed import" to signifiy that that import has failed.
                        event.returnValue = null;
                        //stops electron from waiting for a returned value from the event itself, meaning it returns null no matter what and the thread is not stopped
                    } catch (error) {
                        // TODO: Add a message to pass over
                        windows.main?.webContents.send('presetManager', { message: 'failed_import', error: error.message });
                        ///Failed import message if the code throws an error
                        //If main exists > Send a bridge named preset mangager > Failed-Import.
                        event.returnValue = null;
                        //stops electron from waiting for a returned value from the event itself, meaning it returns null no matter what and the thread is not stopped
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
