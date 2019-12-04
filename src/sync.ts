const rpc = require("sync-rpc");
const asyncWorkerPath = require.resolve("./sync-worker");
import { VaultReaderFactory, VaultReaderOptions } from "./async";

export default function vaultSync<T>(factory: VaultReaderFactory<T>, opts: VaultReaderOptions): T {
  return rpc(asyncWorkerPath)([factory.toString(), opts]);
}
