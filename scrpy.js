const pRDPclient = require('./promise-client');
const Screen = require('./screen');

const SCREEN_SIZE = { width: 1024, height: 800 };
const ALL_WAIT_TS = 180 * 1000;
const SEND_MOUSE_INTERVAL = 2 * 1000;
const MAX_MULTI_LANTENCY = 10;


class HowLong {
    constructor() {
        this.begain = (new Date()).getTime();
    }
    take_s() {
        return this.take_ms() / 1000;
    }
    take_ms() {
        return ((new Date()).getTime() - this.begain);
    }
}

let sleep = async (ms) => {
    return new Promise(async (r, j) => {
        setTimeout(() => {
            r();
        }, ms)
    })
}

/**
 * 
 * @param fn {function}
 */
async function timeout(ms, fn, args) {
    return new Promise(async (resolve, reject) => {
        let context = {}
        let t = setTimeout(() => {
            context.cancel = true;
            reject(new Error("timeout", `timeout err in function ${fn.name}`));
        }, ms);
        try {
            let r = await fn(context, args);
            clearTimeout(t);
            resolve(r);
        } catch (e) {
            clearTimeout(t);
            reject(e)
        }
    })
}

/**
 * @description unstable function
 * @param context {Object}
 * @param s {Screen}
 */
async function wait_pic(context, s) {
    return new Promise(async (resolve, reject) => {
        let latest_ts = 0, recv_bitmaps_count = 0, sum_lantency_ts = 0, avg_lantency = 0, t = 0;
        s.on('bitmaps', (len, howlong) => {
            if (context.cancel){
                clearTimeout(t);
                resolve();
            }
            let ms = howlong.take_ms();
            sum_lantency_ts += ms - latest_ts;
            recv_bitmaps_count++;
            if (latest_ts && len > 10) {
                avg_lantency = parseFloat((sum_lantency_ts / recv_bitmaps_count).toFixed(2));
                console.log(`on bitmaps len:${len},current_lantency:${ms - latest_ts}ms,count:${recv_bitmaps_count},avg_lantency:${avg_lantency}ms/c`, ms, "ms");
            } else {
                console.log(`on bitmaps len:${len},current_lantency:${ms - latest_ts}ms,count:${recv_bitmaps_count},avg_lantency:${avg_lantency}ms/c`, ms, "ms");
            }

            if (len < 10 && avg_lantency != 0) {
                clearTimeout(t);
                t = setTimeout(async () => {
                    console.log(`Exceeding timeout len:${len},count:${recv_bitmaps_count},current_lantency:${howlong.take_ms() - latest_ts}ms,avg_lantency:${avg_lantency}ms/c`, howlong.take_ms(), "ms");
                    resolve();
                }, avg_lantency * MAX_MULTI_LANTENCY);
            }
            latest_ts = ms;
        })
    })

}


let scrpy_rdp = async (ip, port = 3389) => {
    let screen = new Screen(SCREEN_SIZE);
    let howlong = new HowLong();
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
        .on('close', async function (client) {
            screen.emit('close', client);
        })
        .on('bitmap', async function (bitmap) {
            screen.update(bitmap);
        })
        .on('bitmaps', (len) => {
            screen.emit('bitmaps', len, howlong);
        })
        .on('error', function (err) {
            if (err.code == 'ECONNRESET') {
                return
            }
            console.log("on error", err)
        })

    try {
        await client.connect(ip, port);
        console.log("connected");

        let mouseItv = setInterval(() => {
            let x = SCREEN_SIZE.width - 10 + Math.floor(Math.random() * 10);
            let y = Math.floor(Math.random() * 10);
            let button = 0;
            let isPressed = false;
            client.client.sendPointerEvent(x, y, button, isPressed);
        }, SEND_MOUSE_INTERVAL)

        try {
            await timeout(ALL_WAIT_TS, wait_pic, screen);
        } catch (err) {
            if (err.message != "timeout") {
                console.error(err);
            }
        }

        client.end();
        await client.close();
        clearInterval(mouseItv);
        return {
            buf: await screen.get_low_jpeg_buf(),
            ip: ip,
            port: port
        }
    } catch (e) {
        console.error(e);
    }
}

module.exports = { scrpy_rdp, timeout, sleep }

