const scrpy_rdp = require("./scrpy");
const analysisLog = require('why-is-node-running');
const { getSystemErrorMap } = require("util");

(async () => {
    let ip = "192.168.31.8";
    let port = 3389
    if (process.argv[2]) {
        ip = process.argv[2]
    }
    if (process.argv[3]) {
        port = process.argv[3]
    }
    let r = await scrpy_rdp(ip, port);
    console.log(r);
    //analysisLog();
})()

