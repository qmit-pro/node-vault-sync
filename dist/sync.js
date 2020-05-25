"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rpc = require("sync-rpc");
const syncWorkerPath = require.resolve("./sync-worker");
function vaultSync(factory, opts) {
    return rpc(syncWorkerPath)([factory.toString(), JSON.stringify(opts || {})]);
}
exports.default = vaultSync;
//# sourceMappingURL=sync.js.map