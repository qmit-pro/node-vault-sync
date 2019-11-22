"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rpc = require("sync-rpc");
const asyncWorkerPath = require.resolve("./sync-worker");
function vaultSync(factory, opts) {
    return rpc(asyncWorkerPath)([factory.toString(), opts]);
}
exports.default = vaultSync;
//# sourceMappingURL=sync.js.map