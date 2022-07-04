const [{ app }, Window] = ['electron', '../base/Window.js'].map(require);
const versionCheck = require('github-version-checker');
const { windows } = require( '../base/Manager' );

module.exports = class Update extends Window {
    constructor() {
        super().create({ ...windows.properties, width: 300, height: 150 });
        this.checkUpdate();
    }

    checkUpdate() {
        versionCheck({ repo: 'rs3-ability-tracker', owner: 'txj-xyz', currentVersion: app.getVersion() }, (_, update) => {
            // callback function
            // {
            //   name: '[Windows 10+] Release v1.1.5 Alpha',
            //   tag: { name: '1.1.5' },
            //   isPrerelease: true,
            //   publishedAt: '2022-06-12T20:47:06Z',
            //   url: 'https://github.com/txj-xyz/rs3-ability-tracker/releases/tag/1.1.5'
            // }
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
