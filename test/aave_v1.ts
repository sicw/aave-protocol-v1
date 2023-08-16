import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {anyValue} from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import {expect} from "chai";
import {ethers} from "hardhat";
import {LendingPoolConfigurator} from "../typechain-types/contracts/lendingpool/LendingPoolConfigurator";

describe("Aave v1", function () {
    async function deployTestEnvFixture() {
        const [owner, otherAccount] = await ethers.getSigners();

        const tokenDistributorFactory = await ethers.getContractFactory("TokenDistributor");
        const tokenDistributor = await tokenDistributorFactory.deploy();

        const feeProviderFactory = await ethers.getContractFactory("FeeProvider");
        const feeProvider = await feeProviderFactory.deploy();

        const lendingRateOracleFactory = await ethers.getContractFactory("LendingRateOracle");
        const lendingRateOracle = await lendingRateOracleFactory.deploy();

        const priceOracleFactory = await ethers.getContractFactory("PriceOracle");
        const priceOracle = await priceOracleFactory.deploy();

        // 无用
        // const ethereumAddressFactory = await ethers.getContractFactory("EthereumAddress");
        // const ethereumAddress = await ethereumAddressFactory.deploy();

        const lendingPoolDataProviderFactory = await ethers.getContractFactory("LendingPoolDataProvider");
        const lendingPoolDataProvider = await lendingPoolDataProviderFactory.deploy();

        const lendingPoolLiquidationManagerFactory = await ethers.getContractFactory("LendingPoolLiquidationManager");
        const lendingPoolLiquidationManager = await lendingPoolLiquidationManagerFactory.deploy();

        const lendingPoolConfiguratorFactory = await ethers.getContractFactory("LendingPoolConfigurator");
        const lendingPoolConfigurator = await lendingPoolConfiguratorFactory.deploy();

        // 手动设置
        // const lendingPoolManagerFactory = await ethers.getContractFactory("LendingPoolManager");
        // const lendingPoolManager = await lendingPoolManagerFactory.deploy();

        const lendingPoolParametersProviderFactory = await ethers.getContractFactory("LendingPoolParametersProvider");
        const lendingPoolParametersProvider = await lendingPoolParametersProviderFactory.deploy();

        const coreLibraryFactory = await ethers.getContractFactory("CoreLibrary");
        const coreLibrary = await coreLibraryFactory.deploy();

        const lendingPoolCoreFactory = await ethers.getContractFactory("LendingPoolCore", {
            libraries: {
                CoreLibrary: await coreLibrary.getAddress(),
            },
        });
        const lendingPoolCore = await lendingPoolCoreFactory.deploy();

        const lendingPoolFactory = await ethers.getContractFactory("LendingPool");
        const lendingPool = await lendingPoolFactory.deploy();

        const lendingPoolAddressesProviderFactory = await ethers.getContractFactory("LendingPoolAddressesProvider");
        const lendingPoolAddressesProvider = await lendingPoolAddressesProviderFactory.deploy();

        /* set address provider and proxy init data */
        await lendingPoolAddressesProvider.setTokenDistributor(await tokenDistributor.getAddress());
        await lendingPoolAddressesProvider.setFeeProviderImpl(await feeProvider.getAddress());
        await lendingPoolAddressesProvider.setLendingRateOracle(await lendingRateOracle.getAddress());
        await lendingPoolAddressesProvider.setPriceOracle(await priceOracle.getAddress());
        await lendingPoolAddressesProvider.setLendingPoolDataProviderImpl(await lendingPoolDataProvider.getAddress());
        await lendingPoolAddressesProvider.setLendingPoolLiquidationManager(await lendingPoolLiquidationManager.getAddress());
        await lendingPoolAddressesProvider.setLendingPoolManager(await owner.getAddress());
        await lendingPoolAddressesProvider.setLendingPoolConfiguratorImpl(await lendingPoolConfigurator.getAddress());
        await lendingPoolAddressesProvider.setLendingPoolParametersProviderImpl(await lendingPoolParametersProvider.getAddress());
        await lendingPoolAddressesProvider.setLendingPoolCoreImpl(await lendingPoolCore.getAddress());
        await lendingPoolAddressesProvider.setLendingPoolImpl(await lendingPool.getAddress());

        const tokenDistributorProxy = tokenDistributor.attach(await lendingPoolAddressesProvider.getTokenDistributor());
        const feeProviderProxy = feeProvider.attach(await lendingPoolAddressesProvider.getFeeProvider());
        const lendingRateOracleProxy = lendingRateOracle.attach(await lendingPoolAddressesProvider.getLendingRateOracle());
        const priceOracleProxy = priceOracle.attach(await lendingPoolAddressesProvider.getPriceOracle());
        const lendingPoolDataProviderProxy = lendingPoolDataProvider.attach(await lendingPoolAddressesProvider.getLendingPoolDataProvider());
        const lendingPoolLiquidationManagerProxy = lendingPoolLiquidationManager.attach(await lendingPoolAddressesProvider.getLendingPoolLiquidationManager());
        const lendingPoolConfiguratorProxy = lendingPoolConfigurator.attach(await lendingPoolAddressesProvider.getLendingPoolConfigurator());
        const lendingPoolParametersProviderProxy = lendingPoolParametersProvider.attach(await lendingPoolAddressesProvider.getLendingPoolParametersProvider());
        const lendingPoolCoreProxy = lendingPoolCore.attach(await lendingPoolAddressesProvider.getLendingPoolCore());
        const lendingPoolProxy = lendingPool.attach(await lendingPoolAddressesProvider.getLendingPool());

        return {
            tokenDistributorProxy,
            feeProviderProxy,
            lendingRateOracleProxy,
            priceOracleProxy,
            lendingPoolDataProviderProxy,
            lendingPoolLiquidationManagerProxy,
            lendingPoolConfiguratorProxy,
            lendingPoolParametersProviderProxy,
            lendingPoolCoreProxy,
            lendingPoolProxy,
            lendingPoolAddressesProvider
        };
    }

    describe("Lending pool", function () {
        it.skip("initReserve", async function () {
            const {
                tokenDistributorProxy,
                feeProviderProxy,
                lendingRateOracleProxy,
                priceOracleProxy,
                lendingPoolDataProviderProxy,
                lendingPoolLiquidationManagerProxy,
                lendingPoolConfiguratorProxy,
                lendingPoolParametersProviderProxy,
                lendingPoolCoreProxy,
                lendingPoolProxy,
                lendingPoolAddressesProvider
            } = await loadFixture(deployTestEnvFixture);

            const mockMANAFactory = await ethers.getContractFactory("MockMANA");
            const mockMANA = await mockMANAFactory.deploy();

            const defaultReserveInterestRateStrategyFactory = await ethers.getContractFactory("DefaultReserveInterestRateStrategy");
            const defaultReserveInterestRateStrategy = await defaultReserveInterestRateStrategyFactory.deploy(await mockMANA.getAddress(), await lendingPoolAddressesProvider.getAddress(), 1, 1, 1, 1, 1);

            // 不能直接用部署的地址, 应该用代理
            // attach用来关联新地址
            await lendingPoolConfiguratorProxy.initReserve(await mockMANA.getAddress(), 18, await defaultReserveInterestRateStrategy.getAddress());
        });

        it("deposit", async function () {
            const {
                tokenDistributorProxy,
                feeProviderProxy,
                lendingRateOracleProxy,
                priceOracleProxy,
                lendingPoolDataProviderProxy,
                lendingPoolLiquidationManagerProxy,
                lendingPoolConfiguratorProxy,
                lendingPoolParametersProviderProxy,
                lendingPoolCoreProxy,
                lendingPoolProxy,
                lendingPoolAddressesProvider
            } = await loadFixture(deployTestEnvFixture);

            const mockMANAFactory = await ethers.getContractFactory("MockMANA");
            const mockMANA = await mockMANAFactory.deploy();

            const defaultReserveInterestRateStrategyFactory = await ethers.getContractFactory("DefaultReserveInterestRateStrategy");
            const defaultReserveInterestRateStrategy = await defaultReserveInterestRateStrategyFactory.deploy(await mockMANA.getAddress(), await lendingPoolAddressesProvider.getAddress(), 1, 1, 1, 1, 1);

            // todo 暂时重新设置LendPool地址, 不清楚线上怎么搞的
            await lendingPoolCoreProxy.refreshConfigInternal();

            // 不能直接用部署的地址, 应该用代理
            // attach用来关联新地址
            await lendingPoolConfiguratorProxy.initReserve(await mockMANA.getAddress(), 18, await defaultReserveInterestRateStrategy.getAddress());

            await mockMANA.mint(20000);
            await mockMANA.approve(await lendingPoolCoreProxy.getAddress(), 10000);
            await lendingPoolProxy.deposit(await mockMANA.getAddress(), 10000, 0);
        });
    });
});
