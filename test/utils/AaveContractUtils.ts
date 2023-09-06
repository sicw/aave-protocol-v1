import hre from 'hardhat'
import LendingPoolAddressesProviderABI
    from "/Users/sicwen/Desktop/aave-protocol-v1/artifacts/contracts/configuration/LendingPoolAddressesProvider.sol/LendingPoolAddressesProvider.json";
import LendingPoolABI
    from "/Users/sicwen/Desktop/aave-protocol-v1/artifacts/contracts/lendingpool/LendingPool.sol/LendingPool.json";
import LendingPoolCoreABI
    from "/Users/sicwen/Desktop/aave-protocol-v1/artifacts/contracts/lendingpool/LendingPoolCore.sol/LendingPoolCore.json";
import {AccountUtil} from "./AccountUtil";
import {lendingPoolAddress, lendingPoolAddressesProviderAddress, lendingPoolCoreAddress} from "../constants/address";
import {impersonateAccount} from "../constants/address";

export class AaveContractUtils {
    static async getLendingPoolAddressesProvider() {
        const signer = await AccountUtil.getImpersonateAccount(impersonateAccount);
        return new hre.ethers.Contract(lendingPoolAddressesProviderAddress, LendingPoolAddressesProviderABI.abi, signer);
    }

    static async getLendingPool() {
        const signer = await AccountUtil.getImpersonateAccount(impersonateAccount);
        return new hre.ethers.Contract(lendingPoolAddress, LendingPoolABI.abi, signer);
    }

    static async getLendingPoolCore() {
        const signer = await AccountUtil.getImpersonateAccount(impersonateAccount);
        return new hre.ethers.Contract(lendingPoolCoreAddress, LendingPoolCoreABI.abi, signer);
    }

}
