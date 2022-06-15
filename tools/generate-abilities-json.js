const { readdirSync, statSync, writeFileSync } = require('fs')
const { join, resolve } = require('path')
const abilFile = require('../cfg/abilities.json').abilities
const path = './ability-window/game-asset-groups/'
const filesMap = [];

const walkSync = (dir, callback) => {
  const files = readdirSync(dir);
  files.forEach((file) => {
    var filepath = join(dir, file);
    var dirname = join(dir).split(/\\/g).pop();
    const stats = statSync(filepath);
    if (stats.isDirectory()) {
      walkSync(filepath, callback);
    } else if (stats.isFile()) {
      callback(filepath, dirname);
    }
  });
};



walkSync(path, (filepath, dirname) => {
    const abilName = filepath.replace(/(\.png|_)/g, ' ').trim().split(/\\/g).pop()
    const foundCD = abilFile.find(abil => abil.name === abilName)?.cooldown ?? null
    // const iconPath = resolve(__dirname, filepath).replace(/\\/g, '/') //DIRECT
    const iconPath = `../${filepath.split(/\\/g).slice(1).join('/')}`
    // console.log(foundCD, abilName)
    filesMap.push({
        name: abilName,
        type: dirname,
        cooldown: foundCD,
        icon: iconPath,
        customIcon: null
    })
})

// console.log(filesMap)
writeFileSync(`./test.json`, JSON.stringify(filesMap, null, 2))