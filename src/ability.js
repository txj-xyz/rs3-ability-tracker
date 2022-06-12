// Import dependencies.
const { BrowserWindow, screen } = require('electron');

// Update config values of ability window.
const updateConfig = _ => {

    // If the window is moved or resized then update config.
    if (JSON.stringify(config.abilityWindow) !== JSON.stringify(windows.ability.getBounds())) {
        config.abilityWindow = windows.ability.getBounds();

        // Update aspect ratio to prevent buggy resize.
        windows.ability.setAspectRatio((((config.abilityWindow.height - 10) * config.numberOfIcons) + 10) / config.abilityWindow.height);
        update();
    }
}

module.exports = async _ => {

    // Make keybinds window globally reachable and set properties.
    windows.ability = new BrowserWindow({
        ...windows.properties, ...{

            // Load width & height from config.
            width: config.abilityWindow.width,
            height: config.abilityWindow.height,

            // Load x & y start position from config, if not found set to center.
            x: config.abilityWindow.x ?? (screen.getPrimaryDisplay().workArea.width - config.abilityWindow.width) / 2,
            y: config.abilityWindow.y ?? (screen.getPrimaryDisplay().workArea.height - config.abilityWindow.height) / 2,
            
            // Minimum height of ability window.
            minHeight: Math.floor(screen.getPrimaryDisplay().workArea.height * 0.04),
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

    // Reinitialize the keybind listener.
    triggers();

    // Hide window buttons if on macOS.
    if (process.platform === 'darwin') windows.ability.setWindowButtonVisibility(false);

    // Window close event.
    windows.ability.on('close', _ => {
        // Update main window contents.
        windows.main.webContents.send('closeAbility');
        unregisterHooks();
        unregisterCooldowns();
        delete windows.ability;
    });

    // When window is moved or resized, update config.
    windows.ability.on('moved', updateConfig);
    windows.ability.on('resize', updateConfig);

    // Force ability window to be on top.
    windows.ability.setAlwaysOnTop(config.alwaysOnTop, "screen-saver");
    windows.ability.setVisibleOnAllWorkspaces(true);

    // Load ability file.
    windows.ability.loadFile(pages('ability'));
}
