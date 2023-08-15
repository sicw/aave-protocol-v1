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
