import vaultAsync, { VaultReaderFactory, VaultReaderOptions } from "./async";

export default function rpcWorker() {
    return function ([factory, opts]: [string, VaultReaderOptions]) {
        return vaultAsync(eval(factory), opts);
    }
}
