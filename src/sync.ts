const rpc = require("sync-rpc");
const syncWorkerPath = require.resolve("./sync-worker");
import { VaultReaderFactory, VaultReaderOptions } from "./async";
export { VaultReaderFactory, VaultReaderOptions };

export default function vaultSync<T, S>(factory: VaultReaderFactory<T, S>, opts: VaultReaderOptions<S>): T {
  return rpc(syncWorkerPath)([factory.toString(), opts]);
}
