import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {anyValue} from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import {expect} from "chai";
import {ethers} from "hardhat";
import {LendingPoolConfigurator} from "../typechain-types/contracts/lendingpool/LendingPoolConfigurator";
import aTokenAbi from "../artifacts/contracts/tokenization/AToken.sol/AToken.json";
import {lendingpool} from "../typechain-types/contracts";
import {AccountUtil} from "./utils/AccountUtil";
import {impersonateAccount} from "./constants/address";
import {AaveContractUtils} from "./utils/AaveContractUtils";
import {defaultSolcOutputSelection} from "hardhat/internal/core/config/default-config";

describe("Aave v1", function () {

    async function deployTestEnvFixture() {
        const lendingPoolAddressesProvider = await AaveContractUtils.getLendingPoolAddressesProvider();
        const lendingPool = await AaveContractUtils.getLendingPool();
        const lendingPoolCore = await AaveContractUtils.getLendingPoolCore();
        return {lendingPoolAddressesProvider, lendingPool, lendingPoolCore};
    }

    describe.skip("fork main network", function () {
        it("read block number", async function () {
            const blockNumber = await ethers.provider.getBlockNumber();
            expect(blockNumber).to.equal(18074875n);
        });
    });

    describe.skip("Lending pool", function () {
        it("case 1", async function () {
            const {lendingPoolAddressesProvider, lendingPool, lendingPoolCore} = await loadFixture(deployTestEnvFixture);
            const result = await lendingPoolCore.getReserves();
            console.log(result);
        });
    });

    describe("Lending pool", function () {

        it("case 2, new LendingPoolCore", async function () {
            const {lendingPoolAddressesProvider} = await loadFixture(deployTestEnvFixture);

            // 本地创建CoreLibrary
            const coreLibraryFactory = await ethers.getContractFactory("CoreLibrary");
            const coreLibrary = await coreLibraryFactory.deploy();

            // 创建新LendingPoolCore
            const lendingPoolCoreFactory = await ethers.getContractFactory("LendingPoolCore", {
                libraries: {
                    CoreLibrary: await coreLibrary.getAddress(),
                },
            });
            const lendingPoolCoreNewImpl = await lendingPoolCoreFactory.deploy();

            // 替换线上代理
            lendingPoolAddressesProvider.setLendingPoolCoreImpl(await lendingPoolCoreNewImpl.getAddress());

            // 获取新LendingPoolCore
            const lendingPoolCoreAddressNew = await lendingPoolAddressesProvider.getLendingPoolCore();
            const lendingPoolCoreNew = await AaveContractUtils.getLendingPoolCoreWithAddress(lendingPoolCoreAddressNew);

            console.log(await lendingPoolCoreNew.CORE_REVISION());
        });

    });
});
