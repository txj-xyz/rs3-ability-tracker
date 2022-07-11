module.exports = {
    executableName: 'RS3-Ability-Tracker',
    name: 'RS3-Ability-Tracker',
    icon: './src/icons/icon',
    asar: true,
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                loadingGif: "./src/icons/loading3.gif",
                iconUrl: 'https://raw.githubusercontent.com/txj-xyz/rs3-ability-tracker/totally-not-master/src/icons/icon.ico',
                setupIcon: './src/icons/icon.ico',
                setupExe: 'RS3-Ability-Tracker-Installer.exe',
                skipUpdateIcon: true,
                title: 'RS3 Ability Tracker',
                name: 'RS3AbilityTracker',
            },
        },
        {
            name: '@electron-forge/maker-dmg',
            config: {
                icon: './src/icons/icon.icns',
                overwrite: true,
                background: './src/icons/backgroundMacOS.png',
                additionalDMGOptions: {
                    title: 'RS3 Ability Tracker',
                    icon: './src/icons/icon.icns',
                    background: './src/icons/backgroundMacOS.png',
                    window: {
                        size: {
                            width: 700,
                            height: 520,
                        },
                    },
                },
            },
        },
        {
            name: '@electron-forge/maker-zip',
        },
    ],
};
