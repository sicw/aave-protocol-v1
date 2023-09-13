import hre from 'hardhat'
import LendingPoolAddressesProviderABI
    from "/Users/sicwen/Desktop/aave-protocol-v1/artifacts/contracts/configuration/LendingPoolAddressesProvider.sol/LendingPoolAddressesProvider.json";
import LendingPoolABI
    from "/Users/sicwen/Desktop/aave-protocol-v1/artifacts/contracts/lendingpool/LendingPool.sol/LendingPool.json";
import LendingPoolCoreABI
    from "/Users/sicwen/Desktop/aave-protocol-v1/artifacts/contracts/lendingpool/LendingPoolCore.sol/LendingPoolCore.json";
import LendingPoolDataProviderABI
    from "/Users/sicwen/Desktop/aave-protocol-v1/artifacts/contracts/lendingpool/LendingPoolDataProvider.sol/LendingPoolDataProvider.json";

import ATokenABI
    from "/Users/sicwen/Desktop/aave-protocol-v1/artifacts/contracts/tokenization/AToken.sol/AToken.json";

import {AccountUtil} from "./AccountUtil";
import {
    aaveDeployer2Address, aaveDeployer7Address,
    ethRicherAddress,
    lendingPoolAddress,
    lendingPoolAddressesProviderAddress,
    lendingPoolCoreAddress
} from "../constants/address";
import {impersonateAccount} from "../constants/address";

export class AaveContractUtils {
    static async getLendingPoolAddressesProvider() {
        const signer = await AccountUtil.getImpersonateAccount(aaveDeployer2Address);
        return new hre.ethers.Contract(lendingPoolAddressesProviderAddress, LendingPoolAddressesProviderABI.abi, signer);
    }

    static async getLendingPool() {
        const signer = await AccountUtil.getImpersonateAccount(aaveDeployer2Address);
        return new hre.ethers.Contract(lendingPoolAddress, LendingPoolABI.abi, signer);
    }

    static async getLendingPoolCore() {
        const signer = await AccountUtil.getImpersonateAccount(aaveDeployer2Address);
        return new hre.ethers.Contract(lendingPoolCoreAddress, LendingPoolCoreABI.abi, signer);
    }

    static async getLendingPoolCoreWithAddress(address : string) {
        const signer = await AccountUtil.getImpersonateAccount(aaveDeployer2Address);
        return new hre.ethers.Contract(address, LendingPoolCoreABI.abi, signer);
    }

    static async getLendingPoolDataProvider(address : string) {
        const signer = await AccountUtil.getImpersonateAccount(aaveDeployer2Address);
        return new hre.ethers.Contract(address, LendingPoolDataProviderABI.abi, signer);
    }

    static async getAToken(address : string) {
        const signer = await AccountUtil.getImpersonateAccount(aaveDeployer2Address);
        return new hre.ethers.Contract(address, ATokenABI.abi, signer);
    }
}
