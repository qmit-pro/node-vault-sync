import vaultAsync from "./async";
import vaultSync from "./sync";
export declare type VaultReader = typeof vaultSync & {
    async: typeof vaultAsync;
};
declare const vault: VaultReader;
export { vault };
export default vault;
