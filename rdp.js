const rdp = require('./lib');
const Screen = require('./screen');

const SCREEN_SIZE = { width: 1024, height: 800 };


let scrpy_rdp = async (ip, port = 3389) => {
    let result = { ip: ip, port: port }
    let s = await (new Screen((SCREEN_SIZE))).init();

    const client = rdp.createClient({
        domain: '',
        enablePerf: false,
        autoLogin: false,
        decompress: true,
        screen: SCREEN_SIZE,
        locale: 'en',
        logLevel: 'DEBUG'
    })

    await new Promise(async (r) => {
        client
            .on('connect', function () {
                console.log("on connect")
            })
            .on('close', async function () {
                console.log("on close")
                if (client.global.transport.transport.channelsConnected == 0) {
                    result.st = "remote_has_connected";
                    r();
                }
                await s.toFileAsync(`./output/screen2.png`);
                result.b64 = await s.toBase64Async();
                r();
            })
            .on('bitmap', async function (bitmap) {
                s.update(bitmap);
            })
            .on('error', function (err) { console.log("on error", err) })
            .connect(ip, port);

        await sleep(2000);
        let t1 = (new Date()).getTime();
        await s.toFileAsync(`./output/screen1.png`);
        console.log(`screen1 :${new Date().getTime() - t1}ms`);
        client.close();
    })

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
    let ip = "192.168.31.8"//45.11.19.217
    let r = await scrpy_rdp(ip);
    console.log(r);
})()

