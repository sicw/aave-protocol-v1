import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {anyValue} from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import {expect} from "chai";
import {ethers} from "hardhat";

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

        const ethereumAddressFactory = await ethers.getContractFactory("EthereumAddress");
        const ethereumAddress = await ethereumAddressFactory.deploy();

        const lendingPoolDataProviderFactory = await ethers.getContractFactory("LendingPoolDataProvider");
        const lendingPoolDataProvider = await lendingPoolDataProviderFactory.deploy();

        const lendingPoolLiquidationManagerFactory = await ethers.getContractFactory("LendingPoolLiquidationManager");
        const lendingPoolLiquidationManager = await lendingPoolLiquidationManagerFactory.deploy();

        const lendingPoolConfiguratorFactory = await ethers.getContractFactory("LendingPoolConfigurator");
        const lendingPoolConfigurator = await lendingPoolConfiguratorFactory.deploy();

        const lendingPoolManagerFactory = await ethers.getContractFactory("LendingPoolManager");
        const lendingPoolManager = await lendingPoolManagerFactory.deploy();

        const lendingPoolParametersProviderFactory = await ethers.getContractFactory("LendingPoolParametersProvider");
        const lendingPoolParametersProvider = await lendingPoolParametersProviderFactory.deploy();

        const lendingPoolCoreFactory = await ethers.getContractFactory("LendingPoolCore");
        const lendingPoolCore = await lendingPoolCoreFactory.deploy();

        const lendingPoolFactory = await ethers.getContractFactory("LendingPool");
        const lendingPool = await lendingPoolFactory.deploy();

        return {lendingPool};
    }

    describe("Lending pool", function () {
        it("deposit", async function () {
            const {} = await loadFixture(deployTestEnvFixture);
            console.log('123123')
        });
    });
});
