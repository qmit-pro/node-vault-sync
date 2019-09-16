const rpc = require("sync-rpc");
const asyncWorkerPath = require.resolve("./sync-worker");
import { VaultReaderFactory, VaultReaderOptions } from "./async";

export default function vaultSync(factory: VaultReaderFactory, opts: VaultReaderOptions) {
    return rpc(asyncWorkerPath)([factory.toString(), opts]);
}
