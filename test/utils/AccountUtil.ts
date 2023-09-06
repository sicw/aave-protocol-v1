import {HardhatEthersSigner} from "@nomicfoundation/hardhat-ethers/src/signers";
import hre, {ethers} from "hardhat";

export class AccountUtil {
    static async getImpersonateAccount(account: string): Promise<HardhatEthersSigner> {
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [account]
        });
        // @ts-ignore
        return ethers.provider.getSigner(account);
    }
}
