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
                frame: false,
                transparent: true,
                hasShadow: false,
                resizable: !config.lockTrackerWindow,
                alwaysOnTop: true,
                movable: !config.lockTrackerWindow,
            }, false)
        new Confirmation()
        windows.ability.on('moved', this.updateConfig);
        windows.ability.on('resize', this.updateConfig);
        this.updateConfig()
    }

    updateConfig = _ => {
        // If the window is moved or resized then update config.
        if (JSON.stringify(config.abilityWindow) !== JSON.stringify(windows.ability.getBounds())) {
            config.abilityWindow = windows.ability.getBounds();
            config.abilityWindow.width = config.abilityWindow.height * config.numberOfIcons;

            // Update aspect ratio to prevent buggy resize.
                windows.ability?.setResizable(true);
            windows.ability.setSize(config.abilityWindow.height * config.numberOfIcons, config.abilityWindow.height);
            windows.ability.setAspectRatio(+config.numberOfIcons.toFixed(2));
            windows.ability?.setResizable(!config.lockTrackerWindow);
        }
    };
}
