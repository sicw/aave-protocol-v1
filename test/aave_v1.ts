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
    aaveDeployer7Address, aDAIAddress, daiAddress,
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

    describe.skip("getReserves", function () {
        it("case 1", async function () {
            const {lendingPoolAddressesProvider, lendingPool, lendingPoolCore} = await loadFixture(deployTestEnvFixture);
            const result = await lendingPoolCore.getReserves();
            console.log(result);
        });
    });

    describe.skip("update fee provider address", function () {
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

    // tx: 0xf02364679b70045cacd1f21d8345bef39afa1390bb975f51a753d6b1541ba9e8
    describe.skip("query borrow tx", function () {
        it("update fee provider address", async function () {
            const eventABI = ['event Borrow(address indexed _reserve,address indexed _user,uint256 _amount,uint256 _borrowRateMode,uint256 _borrowRate,uint256 _originationFee,uint256 _borrowBalanceIncrease,uint16 indexed _referral,uint256 _timestamp)'];
            const iface = new ethers.Interface(eventABI);
            const filterEncodeData = iface.encodeFilterTopics('Borrow', ['0x6b175474e89094c44da98b954eedeac495271d0f']);
            const logs = await ethers.provider.getLogs({
                fromBlock: 9241323,
                toBlock: 12098222,
                topics: filterEncodeData
            });
            console.log(logs);
        });
    });

    describe.skip("get Ownerable address", function () {
        it("case 1", async function () {
            const {lendingPoolAddressesProvider} = await loadFixture(deployTestEnvFixture);
            console.log(await lendingPoolAddressesProvider.owner());
        });
    });

    describe("get all data", function () {

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

            const getLendingPoolDataProviderAddress = await lendingPoolAddressesProvider.getLendingPoolDataProvider();
            const lendingPoolDataProvider = await AaveContractUtils.getLendingPoolDataProvider(getLendingPoolDataProviderAddress);

            console.log(`\n\n----------------getReserveConfigurationData----------------`)
            const [ltv,
                liquidationThreshold,
                liquidationBonus,
                rateStrategyAddress,
                usageAsCollateralEnabled,
                borrowingEnabled,
                stableBorrowRateEnabled,
                isActive]
                = await lendingPoolDataProvider.getReserveConfigurationData(daiAddress);
            /*
                ltv:75
                liquidationThreshold:80
                liquidationBonus:105
                rateStrategyAddress:0x3bcf425EAf6185d4D478f3D9C858dEacc67CB05f
                usageAsCollateralEnabled:true
                borrowingEnabled:true
                stableBorrowRateEnabled:true
                isActive:true
            * */
            console.log(`ltv:${ltv}`)
            console.log(`liquidationThreshold:${liquidationThreshold}`)
            console.log(`liquidationBonus:${liquidationBonus}`)
            console.log(`rateStrategyAddress:${rateStrategyAddress}`)
            console.log(`usageAsCollateralEnabled:${usageAsCollateralEnabled}`)
            console.log(`borrowingEnabled:${borrowingEnabled}`)
            console.log(`stableBorrowRateEnabled:${stableBorrowRateEnabled}`)
            console.log(`isActive:${isActive}`)

            console.log(`\n\n----------------getReserveData----------------`)
            const [totalLiquidity,
                availableLiquidity,
                totalBorrowsStable,
                totalBorrowsVariable,
                liquidityRate,
                variableBorrowRate,
                stableBorrowRate,
                averageStableBorrowRate,
                utilizationRate,
                liquidityIndex,
                variableBorrowIndex,
                aTokenAddress,
                lastUpdateTimestamp]
                = await lendingPoolDataProvider.getReserveData(daiAddress);

            /*
                totalLiquidity:2619.274103475205556991
                availableLiquidity:1619.274103475205556991
                totalBorrowsStable:0
                totalBorrowsVariable:1000.000000000000000000
                liquidityRate:12927846256478499344798900
                variableBorrowRate:33861572913303013691138106
                stableBorrowRate:115357033322569643811641941
                averageStableBorrowRate:0
                utilizationRate:381785166612848219058209703
                liquidityIndex:1000000000000000000000000000
                variableBorrowIndex:1000000000000000000000000000
                aTokenAddress:0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d
                lastUpdateTimestamp:1578506041
            * */
            console.log(`totalLiquidity:${totalLiquidity}`)
            console.log(`availableLiquidity:${availableLiquidity}`)
            console.log(`totalBorrowsStable:${totalBorrowsStable}`)
            console.log(`totalBorrowsVariable:${totalBorrowsVariable}`)
            console.log(`liquidityRate:${liquidityRate}`)
            console.log(`variableBorrowRate:${variableBorrowRate}`)
            console.log(`stableBorrowRate:${stableBorrowRate}`)
            console.log(`averageStableBorrowRate:${averageStableBorrowRate}`)
            console.log(`utilizationRate:${utilizationRate}`)
            console.log(`liquidityIndex:${liquidityIndex}`)
            console.log(`variableBorrowIndex:${variableBorrowIndex}`)
            console.log(`aTokenAddress:${aTokenAddress}`)
            console.log(`lastUpdateTimestamp:${lastUpdateTimestamp}`)


            console.log(`\n\n----------------getUserAccountData----------------`)
            const [totalLiquidityETH,
                totalCollateralETH,
                totalBorrowsETH,
                totalFeesETH,
                availableBorrowsETH,
                currentLiquidationThreshold,
                userLtv,
                healthFactor] = await lendingPoolDataProvider.getUserAccountData('0xC5EbBB67d0a19DF34899537A74FA67f8c2966f4E');
            console.log(`totalLiquidityETH:${totalLiquidityETH}`)
            console.log(`totalCollateralETH:${totalCollateralETH}`)
            console.log(`totalBorrowsETH:${totalBorrowsETH}`)
            console.log(`totalFeesETH:${totalFeesETH}`)
            console.log(`availableBorrowsETH:${availableBorrowsETH}`)
            console.log(`currentLiquidationThreshold:${currentLiquidationThreshold}`)
            console.log(`ltv:${userLtv}`)
            console.log(`healthFactor:${healthFactor}`)


            console.log(`\n\n----------------getUserReserveData----------------`)
            const [currentATokenBalance,
                currentBorrowBalance,
                principalBorrowBalance,
                borrowRateMode,
                borrowRate,
                userLiquidityRate,
                originationFee,
                userVariableBorrowIndex,
                userLastUpdateTimestamp,
                userUsageAsCollateralEnabled] = await lendingPoolDataProvider.getUserReserveData(daiAddress, '0x5d3183cB8967e3C9b605dc35081E5778EE462328');
            console.log(`currentATokenBalance:${currentATokenBalance}`)
            console.log(`currentBorrowBalance:${currentBorrowBalance}`)
            console.log(`principalBorrowBalance:${principalBorrowBalance}`)
            console.log(`borrowRateMode:${borrowRateMode}`)
            console.log(`borrowRate:${borrowRate}`)
            console.log(`liquidityRate:${userLiquidityRate}`)
            console.log(`originationFee:${originationFee}`)
            console.log(`variableBorrowIndex:${userVariableBorrowIndex}`)
            console.log(`lastUpdateTimestamp:${userLastUpdateTimestamp}`)
            console.log(`usageAsCollateralEnabled:${userUsageAsCollateralEnabled}`)
        });
    });
});
