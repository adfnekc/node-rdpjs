const scrpy_rdp = require("./scrpy");
const analysisLog = require('why-is-node-running');
const { getSystemErrorMap } = require("util");

(async () => {
    let ip = "192.168.31.8";
    if (process.argv[2]){
        ip = process.argv[2]
    }
    let r = await scrpy_rdp(ip);
    console.log(r);
    //analysisLog();
})()

