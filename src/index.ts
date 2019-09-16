import vaultAsync from "./async";
import vaultSync from "./sync";

type VaultReader = typeof vaultSync & { async: typeof vaultAsync };

// @ts-ignore
const vault: VaultReader = vaultSync;
vault.async = vaultAsync;
export = vault;
