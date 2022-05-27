// Import dependencies.
const { BrowserWindow, screen } = require('electron');
const { writeFileSync } = require('fs');
const updateConfig = _ => {
    if (JSON.stringify(config.abilityWindow) !== JSON.stringify(windows.ability.getBounds())) {
        config.abilityWindow = windows.ability.getBounds();
        windows.ability.setAspectRatio((((config.abilityWindow.height - 10) * config.numberOfIcons) + 10) / config.abilityWindow.height);
        writeFileSync('./cfg/config.json', JSON.stringify(config, null, 4));
    }
}

module.exports = _ => {

    // Make keybinds window globally reachable and set properties.
    windows.ability = new BrowserWindow({
        ...windows.properties, ...{
            width: config.abilityWindow.width,
            height: config.abilityWindow.height,
            x: config.abilityWindow.x ?? (screen.getPrimaryDisplay().workArea.width - config.abilityWindow.width) / 2,
            y: config.abilityWindow.y ?? (screen.getPrimaryDisplay().workArea.height - config.abilityWindow.height) / 2,
            fullscreenable: false,
            titleBarStyle: 'hidden',
            frame: false,
            transparent: true,
            hasShadow: false,
            resizable: true,
            alwaysOnTop: config.alwaysOnTop,
            show: true
        }
    });

    if (process.platform === 'darwin') windows.ability.setWindowButtonVisibility(false);

    windows.ability.on('close', _ => {
        windows.main.webContents.send('closeAbility');
        delete windows.ability;
    });

    windows.ability.on('moved', updateConfig)
    windows.ability.on('resize', updateConfig)
    windows.ability.setAlwaysOnTop(config.alwaysOnTop, "screen-saver");
    windows.ability.setVisibleOnAllWorkspaces(true);

    // Load keybinds file.
    windows.ability.loadFile(pages('ability'));
}