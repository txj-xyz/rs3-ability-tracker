// const { uIOhook } = require('uiohook-napi');
// uIOhook.start();
// let arrTemp = [];
// let modifiers = ['altKey', 'ctrlKey', 'shiftKey', 'metaKey'];

// uIOhook.on('keydown', trigger => {
//     if(!trigger.includes())
//     console.log(Date.now(), trigger)
// });

const { readdirSync } = require('fs')
const path = './ability-window/game-asset-groups/'
const dir = readdirSync(path,  { withFileTypes: true })
const filesMap = new Map();

//parse all ability icons and put them in a map
for (const directory of dir) {
    if (!directory.isDirectory()) continue;
    for(const file of readdirSync(path + directory.name, { withFileTypes: true })) {
        if(!file.isFile()) continue;
        console.log(path + directory.name + '/' + file.name)
        filesMap.set(file.name.replace(/\.png/g, ''), {
            name: file.name,
            type: directory.name,
            path: path + directory.name,
        })
    }
}

console.log(filesMap)