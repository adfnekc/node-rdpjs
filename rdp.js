const pRDPclient = require('./promise-client');
const Screen = require('./screen');
const { randomInt } = require('crypto');
const SCREEN_SIZE = { width: 1024, height: 800 };


let scrpy_rdp = async (ip, port = 3389) => {
    let result = { ip: ip, port: port }
    let s = new Screen(SCREEN_SIZE);

    const client = new pRDPclient({
        domain: '',
        enablePerf: false,
        autoLogin: false,
        decompress: true,
        screen: SCREEN_SIZE,
        locale: 'en',
        logLevel: 'DEBUG'
    })

    client.client
        .on('connect', function () {
            console.log("connect ...");
        })
        .on('close', async function (client) {
            console.log("on close")
            if (client.global.transport.transport.channelsConnected == 0) {
                result.st = "remote_has_connected";
                r();
            }
            await s.toFileAsync(`./output/screen.jpg`);
            result.b64 = await s.toBase64Async();
        })
        .on('bitmap', async function (bitmap) {
            s.update(bitmap);
        })
        .on('bitmaps', ({ len }) => {
            console.log("on bitmaps", len, tsc(), "s");
            (async () => {
                result.b64 = await s.toBase64Async();
            })()
        })
        .on('error', function (err) { console.log("on error", err) })

    try {
        let ts = (new Date()).getTime()
        var tsc = () => {
            return ((new Date()).getTime() - ts) / 1000;
        }
        await client.connect(ip, port)

        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.on('line', (line) => {
            console.log("on line", line);
            switch (line) {
                case "s":
                    s.toFileAsync(`./output/latest.jpg`);
                    break;
            }
        });

        let mouseItv = setInterval(() => {
            let x = Math.floor(Math.random() * 10);
            let y = Math.floor(Math.random() * 10);
            let button = 0;
            let isPressed = false;
            //console.log("on mouse", x, y, button, isPressed);
            client.client.sendPointerEvent(x, y, button, isPressed);
        }, 2 * 1000)

        await sleep(60 * 1000);
        result.b64 = await s.toBase64Async();
    } catch (e) {
        console.log(e);
        return null;
    }
    return result;
}

let sleep = async (ms) => {
    return new Promise((r, j) => {
        setTimeout(() => {
            r();
        }, ms)
    })
}

(async () => {
    let ip = "45.11.19.217"//45.11.19.217
    let r = await scrpy_rdp(ip);
    console.log(r);
})()

