import hre from 'hardhat'
import AaveProtocolDataProviderABI
    from "/Users/sicwen/Desktop/aave-protocol-v1/artifacts/contracts/lendingpool/LendingPoolDataProvider.sol/LendingPoolDataProvider.json";
import LendingPoolABI
    from "/Users/sicwen/Desktop/aave-protocol-v1/artifacts/contracts/lendingpool/LendingPool.sol/LendingPool.json";
import LendingPoolCoreABI
    from "/Users/sicwen/Desktop/aave-protocol-v1/artifacts/contracts/lendingpool/LendingPoolCore.sol/LendingPoolCore.json";
import {AccountUtil} from "./AccountUtil";
import {lendingPoolAddress, lendingPoolAddressesProviderAddress, lendingPoolCoreAddress} from "../constants/address";
import {impersonateAccount} from "../constants/address";

export class AaveContractUtils {
    static async getProtocolDataProvider() {
        const signer = await AccountUtil.getImpersonateAccount(impersonateAccount);
        return new hre.ethers.Contract(lendingPoolAddressesProviderAddress, AaveProtocolDataProviderABI.abi, signer);
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
