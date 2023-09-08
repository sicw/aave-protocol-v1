import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {anyValue} from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import {expect} from "chai";
import hre, {ethers} from "hardhat";
import {LendingPoolConfigurator} from "../typechain-types/contracts/lendingpool/LendingPoolConfigurator";
import aTokenAbi from "../artifacts/contracts/tokenization/AToken.sol/AToken.json";
import {lendingpool} from "../typechain-types/contracts";
import {AccountUtil} from "./utils/AccountUtil";
import {
    aaveDeployer2Address,
    aaveDeployer7Address,
    ethRicherAddress,
    impersonateAccount,
    lendingPoolAddressesProviderAddress
} from "./constants/address";
import {AaveContractUtils} from "./utils/AaveContractUtils";
import {defaultSolcOutputSelection} from "hardhat/internal/core/config/default-config";
import {EthUtil} from "./utils/EthUtil";
import LendingPoolAddressesProviderABI
    from "../artifacts/contracts/configuration/LendingPoolAddressesProvider.sol/LendingPoolAddressesProvider.json";

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

    describe.skip("Lending pool", function () {
        it("update fee provider address", async function () {
            const signer = await AccountUtil.getImpersonateAccount(aaveDeployer7Address);
            const lendingPoolAddressesProvider = new hre.ethers.Contract(lendingPoolAddressesProviderAddress, LendingPoolAddressesProviderABI.abi, signer);
            await EthUtil.transfer(ethRicherAddress, aaveDeployer7Address, 10);

            console.log(1)
            await lendingPoolAddressesProvider.setTokenDistributor('0xebb17ec2bce083605a9a665cbd905ece11e5498a');
            console.log(2)

            const feeProviderFactory = await ethers.getContractFactory("FeeProvider");
            const feeProviderNew = await feeProviderFactory.deploy();

            // 关键点: 设置合约的version要大于原来的版本
            // 线上version = 3
            // 所以设置为3以上即可
            await lendingPoolAddressesProvider.setFeeProviderImpl(await feeProviderNew.getAddress());
            console.log(3)

            // 替换线上代理
            //await EthUtil.transfer(ethRicherAddress, aaveDeployer7Address, 10);
            // const newLendingPoolCoreImplAddress = await lendingPoolCoreNewImpl.getAddress();
            //await lendingPoolAddressesProvider.setLendingPoolCoreImpl('0x2847a5d7ce69790cb40471d454feb21a0be1f2e3');
        });
    });

    describe("Lending pool", function () {

        it("set new LendingPoolCore address", async function () {
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
            await EthUtil.transfer(ethRicherAddress, aaveDeployer7Address, 10);
            const newLendingPoolCoreImplAddress = await lendingPoolCoreNewImpl.getAddress();
            await lendingPoolAddressesProvider.setLendingPoolCoreImpl(newLendingPoolCoreImplAddress);

            // 获取新LendingPoolCore
            const lendingPoolCoreAddressNew = await lendingPoolAddressesProvider.getLendingPoolCore();
            const lendingPoolCoreNew = await AaveContractUtils.getLendingPoolCoreWithAddress(lendingPoolCoreAddressNew);

            console.log(await lendingPoolCoreNew.CORE_REVISION());
        });

    });
});
