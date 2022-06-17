const { readdirSync, statSync, writeFileSync } = require('fs')
const { join, resolve } = require('path')
const abilFile = require('../src/cfg/game-key-data.json')
const path = './ability-window/game-asset-groups/'
const filesMap = [];

const walkSync = (dir, callback) => {
  const files = readdirSync(dir);
  files.forEach((file) => {
    var filepath = join(dir, file);
    var dirname = join(dir).split(/\\/g).pop() ?? null;
    var dirParent = join(dir).split(/\\/g).slice(2,3).toString() ?? null;
    const stats = statSync(filepath);
    if (stats.isDirectory()) {
      walkSync(filepath, callback);
    } else if (stats.isFile()) {
      callback(filepath, {name: dirname, parent: dirParent});
    }
  });
};



walkSync(path, (filepath, pathDetails) => {
    const abilName = filepath.replace(/(\.png|_)/g, ' ').trim().split(/\\/g).pop()
    const foundCD = abilFile.find(abil => abil.name === abilName)?.cooldown ?? null
    // const iconPath = resolve(__dirname, filepath).replace(/\\/g, '/') //DIRECT
    const iconPath = `../${filepath.split(/\\/g).slice(1).join('/')}`
    // console.log(foundCD, abilName)
    filesMap.push({
        name: abilName,
        type: pathDetails,
        cooldown: foundCD,
        icon: iconPath,
        customIcon: null
    })
})

console.log(JSON.stringify(filesMap, null, 2))
// writeFileSync(`./test.json`, JSON.stringify(filesMap, null, 2))