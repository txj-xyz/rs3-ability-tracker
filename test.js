const { uIOhook } = require('uiohook-napi');
uIOhook.start();
let i = 0;
const map = new Map();
const abilityConfig = [
    {
        "name": "Wild_Magic",
        "key": ["Q", "Shift + Q"],
        "cooldown": 20.4,
        "icon": null
    },
    {
        "name": "Test_Magic",
        "key": ["W", "Shift + W"],
        "cooldown": 20.4,
        "icon": null
    },
]


abilityConfig.map(set => set.key.map(key => map.set(key, set)))


// const previousSuccess = Date.now();


uIOhook.on('keydown', trigger => {
    // const timeAtPress = Date.now();

    console.log({
        timeAtPress,
        timeDiff: timeAtPress - previousSuccess,
        stillInCD: (timeAtPress - previousSuccess) < map.get('Q').cooldown * 600,
        triggerRaw: trigger,
        iteration: i++,
        rawMap: map,
    })
});