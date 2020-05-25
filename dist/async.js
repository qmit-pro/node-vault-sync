"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultReader = exports.VaultError = exports.K8S_SA_TOKEN_PATH = exports.VAULT_TOKEN_PATH = void 0;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
exports.VAULT_TOKEN_PATH = path_1.default.join(process.env.HOME, ".vault-token");
exports.K8S_SA_TOKEN_PATH = "/var/run/secrets/kubernetes.io/serviceaccount/token";
function vaultAsync(factory, opts) {
    // validate arguments
    if (typeof factory != "function") {
        throw new Error("First argument should be a factory function which returns configuration value");
    }
    else if (typeof opts != "object") {
        throw new Error("Second argument should be a object for Vault connection option");
    }
    const reader = new VaultReader(opts);
    return reader.generateWithFactory(factory);
}
exports.default = vaultAsync;
class VaultError extends Error {
    constructor(props, code) {
        super(props);
        this.code = code;
    }
}
exports.VaultError = VaultError;
class VaultReader {
    constructor(opts) {
        this.opts = {
            uri: "https://server.vault.svc.cluster.local",
            method: "kubernetes",
            role: "default",
            debug: false,
            ignoreLocalToken: false,
            ignoreK8sSAToken: false,
        };
        this.opts = Object.assign(Object.assign({}, this.opts), opts);
        this.token = null;
    }
    getToken() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.token) {
                return;
            }
            const { uri, method, role, debug, ignoreLocalToken, ignoreK8sSAToken } = this.opts;
            let vaultToken;
            if (!ignoreLocalToken && fs_1.default.existsSync(exports.VAULT_TOKEN_PATH)) {
                vaultToken = fs_1.default.readFileSync(exports.VAULT_TOKEN_PATH).toString();
                debug && console.log("read local vault token:", vaultToken);
            }
            else if (!ignoreK8sSAToken && fs_1.default.existsSync(exports.K8S_SA_TOKEN_PATH)) {
                const jwt = fs_1.default.readFileSync(exports.K8S_SA_TOKEN_PATH).toString();
                debug && console.log("read k8s sa token:", jwt);
                vaultToken = yield node_fetch_1.default(`${uri}/v1/auth/${method}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ jwt, role }),
                })
                    .then(res => res.json())
                    .then(res => {
                    if (res.errors) {
                        const error = new Error("invalid vault token: " + res.errors.join("\n"));
                        throw error;
                    }
                    debug && console.log("vault auth response:", res);
                    return res.auth.client_token;
                });
                debug && console.log("issued vault token with k8s sa token:", vaultToken);
            }
            else {
                throw new VaultError("Failed to read both vault token and k8s service account token", 401);
            }
            this.token = vaultToken || null;
        });
    }
    generateWithFactory(factory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return factory(this.read.bind(this), this.list.bind(this), (this.opts.sandbox || {}));
        });
    }
    call(itemPath, method) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const { uri } = this.opts;
            const itemURI = `${uri}/v1/${itemPath}`;
            yield this.getToken(); // lazy login
            // @ts-ignore
            return node_fetch_1.default(itemURI, {
                method,
                headers: { "X-Vault-Token": this.token || "" },
            })
                .then((res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const result = yield res.json();
                if (res.status >= 400) {
                    const err = new VaultError("Failed to fetch: " + itemURI, res.status);
                    throw Object.assign(err, result);
                }
                return result.data;
            }));
        });
    }
    read(itemPath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.call(itemPath, "GET");
        });
    }
    list(itemPath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.call(itemPath, "LIST");
        });
    }
}
exports.VaultReader = VaultReader;
//# sourceMappingURL=async.js.map