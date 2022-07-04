const [{ app }, Window] = ['electron', '../base/Window.js'].map(require);
const versionCheck = require('github-version-checker');

module.exports = class Update extends Window {
    constructor() {
        super().create({ ...windows.properties, width: 300, height: 150 });
        this.checkUpdate();
    }

    checkUpdate() {
        versionCheck({ repo: 'rs3-ability-tracker', owner: 'txj-xyz', currentVersion: app.getVersion() }, (_, update) => {
            if (update) {
                windows.update.on('ready-to-show', _ => {
                    windows.update?.show();
                    windows.update?.focus();
                    windows.update?.webContents.send('updateInformation', {...update, currentVersion: app.getVersion()})
                });
            } else {
                windows.update.close();
            }
        });
    }
};
