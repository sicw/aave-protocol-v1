import {ethers} from "hardhat";
import {parseEther} from "ethers";
import ERC20Artifact from "openzeppelin-solidity/build/contracts/IERC20.json";
import {AccountUtil} from "./AccountUtil";

export class Erc20Util {
    static async transfer(coin: string, from: string, to: string, amount: number) {
        const signer = await AccountUtil.getImpersonateAccount(from);
        const erc20Contract = new ethers.Contract(coin, ERC20Artifact.abi, signer);
        const txResp = await erc20Contract.transfer(to, parseEther(String(amount)));
        await txResp.wait();
    }

    static async approve(coin: string, from: string, to: string, amount: number) {
        const signer = await AccountUtil.getImpersonateAccount(from);
        const erc20Contract = new ethers.Contract(coin, ERC20Artifact.abi, signer);
        // 注意这里approve的是POOL池子, 不是aToken
        const txResp = await erc20Contract.approve(to, parseEther(String(amount)));
        // 等待区块确认(默认等待1个)
        await txResp.wait();
    }

    static async balanceOf(coin: string, account: string): Promise<string> {
        const erc20Contract = new ethers.Contract(coin, ERC20Artifact.abi, ethers.provider);
        return Promise.resolve(ethers.formatEther(await erc20Contract.balanceOf(account)));
    }

    static async allowance(coin: string, owner: string, spender: string): Promise<string> {
        const erc20Contract = new ethers.Contract(coin, ERC20Artifact.abi, ethers.provider);
        return Promise.resolve(ethers.formatEther(await erc20Contract.allowance(owner, spender)));
    }
}
