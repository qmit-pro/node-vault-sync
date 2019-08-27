const rpc = require("sync-rpc");
const asyncWorkerPath = require.resolve("./sync-worker");

function makeSync(f, o) {
    if (typeof f == "function") {
        f = f.toString();
    }
    return rpc(asyncWorkerPath)([f, o]);
}

module.exports = makeSync;
