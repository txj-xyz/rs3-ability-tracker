const { readdirSync, statSync } = require('fs')
const { join } = require('path')
const path = './ability-window/game-asset-groups/'
const dir = readdirSync(path,  { withFileTypes: true })
const filesMap = new Map();


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
    console.log({
        fileName: filepath.replace(/.png/g, '').split(/\\/g).pop(),
        pathName: filepath,
        dirName: dirname,
    })
})