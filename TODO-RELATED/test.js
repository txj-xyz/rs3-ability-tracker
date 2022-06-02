const { readFileSync, createWriteStream, existsSync } = require('fs');
const axios = require('axios');

readFileSync('./useful-icons.txt', 'utf8').split('\n').filter(x => x).map(x => {
    x.match(/https.*/g)?.map(y => {
        y = y.split('\t').join(' ').split(' ').filter(x => x);
        let url = y.shift()
        let name = y.map(x => x.replace(/\//g, ' ')).filter(x => x).join('_')
        // console.log(`${name} ${url}`);
        axios({ url, responseType: 'stream' }).then(
            response =>
                new Promise((resolve, reject) => {
                    response.data
                        // .pipe(createWriteStream('./images/' + name + '.png'))
                        .on('finish', resolve)
                        .on('error', _ => console.log(name))
                })
        )
    })
})

let i = 1
readFileSync('./useful-icons.txt', 'utf8').split('\n').filter(x => x).map(x => {
    x.match(/https.*/g)?.map(y => {
        y = y.split('\t').join(' ').split(' ').filter(x => x);
        let url = y.shift()
        let name = y.map(x => x.replace(/\//g, ' ')).filter(x => x).join('_')
        if (!existsSync(`./images/${name}.png`)) {
            console.log(`${name} ${url}`);
        }
    })
}).length
