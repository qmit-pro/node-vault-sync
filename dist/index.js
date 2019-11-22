"use strict";
const tslib_1 = require("tslib");
const async_1 = tslib_1.__importDefault(require("./async"));
const sync_1 = tslib_1.__importDefault(require("./sync"));
const vault = sync_1.default;
vault.async = async_1.default;
module.exports = vault;
//# sourceMappingURL=index.js.map