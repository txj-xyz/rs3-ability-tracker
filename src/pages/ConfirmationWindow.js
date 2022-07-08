const [{ app }, Window] = ['electron', '../base/Window.js'].map(require);

module.exports = class Confirmation extends Window {
    constructor() {
        super().create({ ...windows.properties, width: 650, height: 180 }, true)
        .ipcLoader(this.confirmationListener)
    }

    confirmationListener = (event, param) => {
        if(param) {
            windows.ability?.show();
            windows.ability?.focus();
            if (__platform === 'darwin') windows.ability?.setWindowButtonVisibility(false);
            windows.ability?.setAlwaysOnTop(true, "screen-saver");
            windows.ability?.setVisibleOnAllWorkspaces(true);
            windows.ability?.setBackgroundThrottling(false);
            new Trigger()
        } else {
            windows.ability?.close()
        }
        windows.confirmation?.close()
        event.returnValue = null;
    }
};
