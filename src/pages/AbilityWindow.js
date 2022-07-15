const [{ screen }, Window] = ['electron', '../base/Window.js'].map(require);

module.exports = class Ability extends Window {
    constructor() {
        super().create({
            ...windows.properties,
            width: config.abilityWindow.height * config.numberOfIcons,
            height: config.abilityWindow.height,
            minHeight: 50,
            x: config.abilityWindow.x ?? (screen.getPrimaryDisplay().workArea.width - config.abilityWindow.width) / 2,
            y: config.abilityWindow.y ?? (screen.getPrimaryDisplay().workArea.height - config.abilityWindow.height) / 2,
            frame: false,
            transparent: true,
            hasShadow: false,
            resizable: !config.lockTrackerWindow,
            alwaysOnTop: true,
            movable: !config.lockTrackerWindow,
        });
        this.fixBounds();
        windows.ability?.on('ready-to-show', this.updateSize)
        windows.ability?.on('moved', this.updateSize);
        windows.ability?.on('resized', this.updateSize);
        const WM_INITMENU = 0x0116;
        // const WM_MOVING = 0x0216;
        windows.ability?.hookWindowMessage(WM_INITMENU, () => {
            windows.ability?.setEnabled(false);
            windows.ability?.setEnabled(true);
        });
        windows.ability?.setAspectRatio(config.numberOfIcons);
    }

    fixBounds = _ => {
        setTimeout(_ => {
            if (windows.ability?.getSize()[0] !== config.abilityWindow.height * config.numberOfIcons) {
                windows.ability?.setSize(config.abilityWindow.height * config.numberOfIcons, config.abilityWindow.height);
            }
        }, 50);
    };

    updateSize = _ => {
        // get position
        const [x, y] = windows.ability.getPosition();
        config.abilityWindow.x = x;
        config.abilityWindow.y = y;
        this.fixBounds();

        // fix resize bounds
        let [width, height] = windows.ability.getSize();
        height = height < 50 ? 50 : height;
        config.abilityWindow.height = height;
        config.abilityWindow.width = config.numberOfIcons * height;
        windows.ability?.setSize(config.numberOfIcons * height, height);
    };
};
