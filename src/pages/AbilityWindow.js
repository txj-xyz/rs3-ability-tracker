const { windows } = require("../base/Manager");

const [{ screen }, Window] = ['electron', '../base/Window.js'].map(require)

module.exports = class Ability extends Window {
    constructor() {
        super()
            .create({
                ...windows.properties,
                width: config.abilityWindow.width,
                height: config.abilityWindow.height,
                x: config.abilityWindow.x ?? (screen.getPrimaryDisplay().workArea.width - config.abilityWindow.width) / 2,
                y: config.abilityWindow.y ?? (screen.getPrimaryDisplay().workArea.height - config.abilityWindow.height) / 2,
                rame: false,
                transparent: true,
                hasShadow: false,
                resizable: !config.lockTrackerWindow,
                alwaysOnTop: true,
                show: true,
                movable: !config.lockTrackerWindow,
            }, true)

        // triggers()
        if (__platform === 'darwin') windows.ability.setWindowButtonVisibility(false);

        windows.ability.setAlwaysOnTop(true, "screen-saver");
        windows.ability.setVisibleOnAllWorkspaces(true);
        windows.ability.setBackgroundThrottling(false);

        windows.ability.on('moved', this.updateConfig);
        windows.ability.on('resize', this.updateConfig);
    }

    updateConfig = _ => {
        // If the window is moved or resized then update config.
        if (JSON.stringify(config.abilityWindow) !== JSON.stringify(windows.ability.getBounds())) {
            config.abilityWindow = windows.ability.getBounds();
            config.abilityWindow.width = config.abilityWindow.height * config.numberOfIcons;

            // Update aspect ratio to prevent buggy resize.
            windows.ability.setAspectRatio((config.abilityWindow.height * config.numberOfIcons) / config.abilityWindow.height);
        }
    };
}
