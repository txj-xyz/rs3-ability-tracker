const [{ app }, Window] = ['electron', '../base/Window.js'].map(require);

module.exports = class Confirmation extends Window {
    constructor() {
        super().create({ ...windows.properties, width: 650, height: 160 }, true)
        .ipcLoader(this.confirmationListener)
    }

    confirmationListener = (event, param) => {
        param ? windows.confirmation.close() : quitHandler();
        event.returnValue = null;
    }
};
