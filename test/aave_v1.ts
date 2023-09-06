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
        const protocolDataProvider = await AaveContractUtils.getProtocolDataProvider();
        const lendingPool = await AaveContractUtils.getLendingPool();
        const lendingPoolCore = await AaveContractUtils.getLendingPoolCore();
        return {protocolDataProvider, lendingPool, lendingPoolCore};
    }

    describe("fork main network", function () {
        it("read block number", async function () {
            const blockNumber = await ethers.provider.getBlockNumber();
            expect(blockNumber).to.equal(18074875n);
        });
    });

    describe("Lending pool", function () {
        it("test case 1", async function () {
            const {protocolDataProvider, lendingPool, lendingPoolCore} = await loadFixture(deployTestEnvFixture);
            const result = await lendingPoolCore.getReserves();
            console.log(result);
        });
    });
});
