import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {anyValue} from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import {expect} from "chai";
import {ethers} from "hardhat";
import {LendingPoolConfigurator} from "../typechain-types/contracts/lendingpool/LendingPoolConfigurator";
import aTokenAbi from "../artifacts/contracts/tokenization/AToken.sol/AToken.json";

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
        await lendingPoolAddressesProvider.setLendingPoolLiquidationManager(await lendingPoolLiquidationManager.getAddress());
        await lendingPoolAddressesProvider.setLendingPoolManager(await owner.getAddress());
        await lendingPoolAddressesProvider.setLendingPoolConfiguratorImpl(await lendingPoolConfigurator.getAddress());
        await lendingPoolAddressesProvider.setLendingPoolParametersProviderImpl(await lendingPoolParametersProvider.getAddress());
        await lendingPoolAddressesProvider.setLendingPoolCoreImpl(await lendingPoolCore.getAddress());
        await lendingPoolAddressesProvider.setLendingPoolDataProviderImpl(await lendingPoolDataProvider.getAddress());
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

        // 更新LendingPoolCore中的LendingPool address
        await lendingPoolConfiguratorProxy.refreshLendingPoolCoreConfiguration();

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
            lendingPoolAddressesProvider,
            owner,
            otherAccount
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

        it.skip("deposit", async function () {
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
                lendingPoolAddressesProvider,
                owner
            } = await loadFixture(deployTestEnvFixture);

            const mockMANAFactory = await ethers.getContractFactory("MockMANA");
            const mockMANA = await mockMANAFactory.deploy();

            const defaultReserveInterestRateStrategyFactory = await ethers.getContractFactory("DefaultReserveInterestRateStrategy");
            const defaultReserveInterestRateStrategy = await defaultReserveInterestRateStrategyFactory.deploy(await mockMANA.getAddress(), await lendingPoolAddressesProvider.getAddress(), 1, 1, 1, 1, 1);

            // 不能直接用部署的地址, 应该用代理
            // attach用来关联新地址
            await lendingPoolConfiguratorProxy.initReserve(await mockMANA.getAddress(), 18, await defaultReserveInterestRateStrategy.getAddress());

            await mockMANA.mint(20000);
            await mockMANA.approve(await lendingPoolCoreProxy.getAddress(), 10000);
            await lendingPoolProxy.deposit(await mockMANA.getAddress(), 10000, 0);

            const aTokenAddress = await lendingPoolCoreProxy.getReserveATokenAddress(await mockMANA.getAddress());
            const aTokenContract = await ethers.getContractAt(aTokenAbi.abi, aTokenAddress, owner);
            const balanceOfOwner = await aTokenContract.balanceOf(await owner.getAddress());

            expect(balanceOfOwner).to.equal(10000n);
        });

        it.skip("redeemUnderlying", async function () {
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
                lendingPoolAddressesProvider,
                owner
            } = await loadFixture(deployTestEnvFixture);

            const mockMANAFactory = await ethers.getContractFactory("MockMANA");
            const mockMANA = await mockMANAFactory.deploy();

            const defaultReserveInterestRateStrategyFactory = await ethers.getContractFactory("DefaultReserveInterestRateStrategy");
            const defaultReserveInterestRateStrategy = await defaultReserveInterestRateStrategyFactory.deploy(await mockMANA.getAddress(), await lendingPoolAddressesProvider.getAddress(), 1, 1, 1, 1, 1);

            // 不能直接用部署的地址, 应该用代理
            // attach用来关联新地址
            await lendingPoolConfiguratorProxy.initReserve(await mockMANA.getAddress(), 18, await defaultReserveInterestRateStrategy.getAddress());

            await mockMANA.mint(20000);
            await mockMANA.approve(await lendingPoolCoreProxy.getAddress(), 10000);
            await lendingPoolProxy.deposit(await mockMANA.getAddress(), 10000, 0);

            const aTokenAddress = await lendingPoolCoreProxy.getReserveATokenAddress(await mockMANA.getAddress());
            const aTokenContract = await ethers.getContractAt(aTokenAbi.abi, aTokenAddress, owner);

            // 只能aToken调用赎回操作
            await aTokenContract.redeem(10000);

            const balanceOfOwner = await aTokenContract.balanceOf(await owner.getAddress());
            expect(balanceOfOwner).to.equal(0n);
        });

        it("borrow", async function () {
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
                lendingPoolAddressesProvider,
                owner,
                otherAccount
            } = await loadFixture(deployTestEnvFixture);

            const mockMANAFactory = await ethers.getContractFactory("MockMANA");
            const mockMANA = await mockMANAFactory.deploy();

            const mockLINKFactory = await ethers.getContractFactory("MockLINK");
            const mockLINK = await mockLINKFactory.connect(otherAccount).deploy();

            const mockMANADefaultReserveInterestRateStrategyFactory = await ethers.getContractFactory("DefaultReserveInterestRateStrategy");
            const mockMANADefaultReserveInterestRateStrategy = await mockMANADefaultReserveInterestRateStrategyFactory.deploy(await mockMANA.getAddress(), await lendingPoolAddressesProvider.getAddress(), 1, 1, 1, 1, 1);

            const mockLINKDefaultReserveInterestRateStrategyFactory = await ethers.getContractFactory("DefaultReserveInterestRateStrategy");
            const mockLINKDefaultReserveInterestRateStrategy = await mockLINKDefaultReserveInterestRateStrategyFactory.deploy(await mockLINK.getAddress(), await lendingPoolAddressesProvider.getAddress(), 1, 1, 1, 1, 1);

            await priceOracleProxy.setAssetPrice(await mockMANA.getAddress(), 1000000000000000000n);
            await priceOracleProxy.setAssetPrice(await mockLINK.getAddress(), 1000000000000000000n);

            // 不能直接用部署的地址, 应该用代理
            // attach用来关联新地址
            await lendingPoolConfiguratorProxy.initReserve(await mockMANA.getAddress(), 18, await mockMANADefaultReserveInterestRateStrategy.getAddress());
            await lendingPoolConfiguratorProxy.initReserve(await mockLINK.getAddress(), 18, await mockLINKDefaultReserveInterestRateStrategy.getAddress());

            await mockMANA.mint(20000);
            await mockMANA.approve(await lendingPoolCoreProxy.getAddress(), 10000);
            await lendingPoolProxy.deposit(await mockMANA.getAddress(), 10000, 0);

            await mockLINK.connect(otherAccount).mint(20000);
            await mockLINK.connect(otherAccount).approve(await lendingPoolCoreProxy.getAddress(), 10000);
            await lendingPoolProxy.connect(otherAccount).deposit(await mockLINK.getAddress(), 10000, 0);

            // 开启资金池借款
            await lendingPoolConfiguratorProxy.enableBorrowingOnReserve(await mockMANA.getAddress(), true);

            // 开启资金做为抵押
            await lendingPoolConfiguratorProxy.enableReserveAsCollateral(await mockMANA.getAddress(), 10000, 10000, 10000);
            await lendingPoolConfiguratorProxy.enableReserveAsCollateral(await mockLINK.getAddress(), 10000, 10000, 10000);

            await lendingPoolProxy.connect(otherAccount).borrow(await mockMANA.getAddress(), 1000, 1, 0);
            expect(await mockMANA.balanceOf(await otherAccount.getAddress())).to.equal(1000n);

            const aTokenAddress = await lendingPoolCoreProxy.getReserveATokenAddress(await mockMANA.getAddress());
            const aTokenContract = await ethers.getContractAt(aTokenAbi.abi, aTokenAddress, owner);
            // 数值类型比较 await放到里面
            expect(await aTokenContract.balanceOf(await owner.getAddress())).to.equal(10000n);

            // 带有revertedWith的 await要放到外面
            await expect( aTokenContract.redeem(9001)).to.be.revertedWith("There is not enough liquidity available to redeem");

            await aTokenContract.redeem(9000);
            expect(await aTokenContract.balanceOf(await owner.getAddress())).to.equal(1000n);
        });
    });
});
