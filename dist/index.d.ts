import vaultAsync from "./async";
import vaultSync from "./sync";
declare type VaultReader = typeof vaultSync & {
    async: typeof vaultAsync;
};
declare const vault: VaultReader;
export = vault;
