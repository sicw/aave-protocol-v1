import {ethers} from "hardhat";
import {parseEther} from "ethers";
import {AccountUtil} from "./AccountUtil";

export class EthUtil {
    static async transfer(from: string, to: string, amount: number) {
        const richSigner = await AccountUtil.getImpersonateAccount(from);
        const txResp = await richSigner.sendTransaction({to: to, value: parseEther(String(amount))});
        await txResp.wait();
    }

    static async getBalance(account: string): Promise<string> {
        const balance = await ethers.provider.getBalance(account);
        return Promise.resolve(ethers.formatEther(balance));
    }
}
