const scrpy_rdp = require("./scrpy");
const analysisLog = require('why-is-node-running');

(async () => {
    let ip = "192.168.31.8";
    let r = await scrpy_rdp(ip);
    console.log(r);
    //analysisLog();
})()

