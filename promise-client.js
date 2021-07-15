const EventEmitter = require("events");
const rdp = require("./lib/index");


module.exports = class pRDPclient extends EventEmitter {
    constructor(config) {
        super();
        this.client = rdp.createClient(config);
    }

    async connect(ip, port) {
        this.client.connect(ip, port);
        return new Promise((r, j) => {
            this.client.on('connect', function () {
                r();
            }).once("error", function (err) {
                j(err);
            })
        });
    }

    end() {
        this.client.close();
        this.client.bufferLayer.close();
        this.client.bufferLayer.secureSocket.end();
    }

    async close() {
        return new Promise((r, j) => {
            let t = setTimeout(() => {
                r();
            }, 3 * 1000)
            this.client.on("close", () => {
                clearTimeout(t);
                r();
            });
        })
    }
}