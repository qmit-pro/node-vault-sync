"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vault = void 0;
const tslib_1 = require("tslib");
const async_1 = tslib_1.__importDefault(require("./async"));
const sync_1 = tslib_1.__importDefault(require("./sync"));
const vault = sync_1.default;
exports.vault = vault;
vault.async = async_1.default;
exports.default = vault;
//# sourceMappingURL=index.js.map