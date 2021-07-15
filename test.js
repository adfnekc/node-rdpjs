const { scrpy_rdp, timeout, sleep } = require("./scrpy");
const analysisLog = require('why-is-node-running');
(async () => {
    let ip = "127.0.0.1";
    let port = 3389
    if (process.argv[2]) {
        ip = process.argv[2]
    }
    if (process.argv[3]) {
        port = process.argv[3]
    }
    let r = await scrpy_rdp(ip, port);
    console.log(r);
    process.exit(0)
})()

