import { VaultReaderOptions } from "./async";
export default function rpcWorker(): ([factory, opts]: [string, VaultReaderOptions]) => Promise<unknown>;
