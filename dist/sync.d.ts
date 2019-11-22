import { VaultReaderFactory, VaultReaderOptions } from "./async";
export default function vaultSync<T>(factory: VaultReaderFactory<T>, opts: VaultReaderOptions): T;
