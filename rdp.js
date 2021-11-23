const { scrpy_rdp, timeout, sleep } = require("./scrpy");
const { writeFile } = require('fs/promises');
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
    await writeFile(`${ip}_${port}.json`, JSON.stringify(r))
    process.exit(0)
})()

