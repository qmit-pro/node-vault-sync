import { VaultReaderFactory, VaultReaderOptions } from "./async";
export { VaultReaderFactory, VaultReaderOptions };
export default function vaultSync<T, S>(factory: VaultReaderFactory<T, S>, opts: VaultReaderOptions<S>): T;
