"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const async_1 = tslib_1.__importDefault(require("./async"));
function rpcWorker() {
    return function ([factory, opts]) {
        return async_1.default(eval(factory), opts);
    };
}
exports.default = rpcWorker;
//# sourceMappingURL=sync-worker.js.map