const { readdirSync, statSync, writeFileSync } = require('fs');
const { app } = require('electron');
const { join, resolve } = require('path');
const _default = require('../src/default/game-key-data.json');
const path = './ability-window/game-asset-groups/';
const filesMap = [];

const walkSync = (dir, callback) => {
    const files = readdirSync(dir);
    files.forEach(file => {
        var filepath = join(dir, file);
        var dirname = join(dir).split(/\\/g).pop() ?? null;
        var dirParent = join(dir).split(/\\/g).slice(2, 3).toString() ?? null;
        const stats = statSync(filepath);
        if (stats.isDirectory()) {
            walkSync(filepath, callback);
        } else if (stats.isFile()) {
            callback(filepath, { name: dirname, parent: dirParent });
        }
    });
};

walkSync(path, (filepath, pathDetails) => {
    const abilName = filepath
        .replace(/(\.png|_)/g, ' ')
        .trim()
        .replace(/\\/g, '/')
        .split(/\//g)
        .pop();
    const iconPath = `../${filepath.replace(/\\/g, '/').split(/\//g).slice(1).join('/')}`;
    filesMap.push({
        name: abilName,
        type: pathDetails.name.replace(/\\/g, '/').split(/\//g).pop(),
        style: _default.find(e => e.name === abilName)?.style,
        icon: iconPath,
        customIcon: null,
    });
});

console.log('[INFO]', filesMap.length, 'icons detected');
writeFileSync(`./src/default/game-key-data.json`, JSON.stringify(filesMap, null, 2));
process.exit();
