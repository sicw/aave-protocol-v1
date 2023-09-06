import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
    solidity: "0.5.5",
    networks: {
        hardhat: {
            allowUnlimitedContractSize: true,
            forking: {
                url: "https://eth-mainnet.g.alchemy.com/v2/l-01EhWuy2ALbml4NcNP7Mk2VJPxWwXK",
                blockNumber: 18074875,
                // url: "https://arb-mainnet.g.alchemy.com/v2/wf0tf5Kj5dez25BZEm7OOthCX1t5MV3s",
                // blockNumber: 107375632,
            }
        }
    }
};

export default config;
