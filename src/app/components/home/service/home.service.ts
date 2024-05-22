import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment.development";
import { writeContract, readContract, waitForTransaction } from "@wagmi/core";

const ContractAbi = require("../../../../abi/stakingContractABI.json");
const RewardContractAbi = require("../../../../abi/ERC20ABI.json");
const SupplyAbi = require("../../../../abi/SupplyABI.json");

@Injectable({
  providedIn: "root",
})
export class HomeService {
  constructor() {}

  async getPoolDetails(i: any, wallet: any) {
    try {
      var poolInfo: any = [];
      const data = await readContract({
        address: environment.STAKING_CONTRACT_ADDRESS as any,
        abi: ContractAbi,
        functionName: "poolInfo",
        args: [i],
      });
      let userInfo: any = await this.getUserInfo(i, wallet);
      console.log("data", data);
      let timeStamp = Date.now();
      let compoundData: any = {};
      compoundData.depositToken = data[0];
      compoundData.balance = await this.getTokenBalance(
        wallet,
        compoundData.depositToken
      );
      compoundData.rewardToken = data[1];
      compoundData.rewardBalance = await this.getTokenBalance(
        wallet,
        compoundData.rewardToken
      );
      compoundData.startTime = Number(data[2]) * 1000;
      compoundData.endTime = Number(data[3]) * 1000;
      compoundData.rewardInterval = Number(data[4]);
      compoundData.rewardRate = data[5];
      compoundData.userStakedAmout = userInfo.userStakedAmout;
      compoundData.userCalculatedReward = userInfo.rewardDetail;
      compoundData.isStake = userInfo.isStake;
      compoundData.isStarted = false;
      compoundData.isCompleted = false;
      if (timeStamp > compoundData.startTime) {
        compoundData.isStarted = true;
      }
      if (timeStamp > compoundData.endTime) {
        compoundData.isCompleted = true;
      }

      poolInfo.push(compoundData);
      return { poolInfo };
    } catch (error) {
      console.error("Error in getPoolDetails:", error);
      throw error;
    }
  }

  async getPoolLength() {
    try {
      const poolLength: any = await readContract({
        address: environment.STAKING_CONTRACT_ADDRESS as any,
        abi: ContractAbi,
        functionName: "poolLength",
        args: [],
      });
      return poolLength;
    } catch (error) {
      console.error("Error in getPoolLength:", error);
      throw error;
    }
  }

  async getApprovedAmount(_wallet: any, depositToken: any) {
    try {
      const approvedAmount: any = await readContract({
        address: depositToken,
        abi: RewardContractAbi,
        functionName: "allowance",
        args: [_wallet, environment.STAKING_CONTRACT_ADDRESS],
      });
      console.log(approvedAmount);
      return Number(approvedAmount) / 10 ** 18;
    } catch (error) {
      console.error("Error in getApprovedAmount:", error);
      throw error;
    }
  }

  async getTokenBalance(wallet: any, rewardToken: any) {
    try {
      const balance: any = await readContract({
        address: rewardToken,
        abi: RewardContractAbi,
        functionName: "balanceOf",
        args: [wallet],
      });
      console.log(balance);
      return Number(balance) / 10 ** 18;
    } catch (error) {
      console.error("Error in getApprovedAmount:", error);
      throw error;
    }
  }

  async deposit(id: any, amount: any) {
    try {
      const { hash } = await writeContract({
        address: environment.STAKING_CONTRACT_ADDRESS as any,
        abi: ContractAbi,
        functionName: "deposit",
        args: [id, +amount * 10 ** 18],
      });

      const data = await waitForTransaction({
        hash: hash,
      });
      return data;
    } catch (error) {
      console.error("Error in deposit:", error);
      throw error;
    }
  }

  async getUserInfo(id: any, wallet: any) {
    try {
      const userDetail: any = await readContract({
        address: environment.STAKING_CONTRACT_ADDRESS as any,
        abi: ContractAbi,
        functionName: "userInfo",
        args: [id, wallet],
      });
      const rewardDetail: any = await readContract({
        address: environment.STAKING_CONTRACT_ADDRESS as any,
        abi: ContractAbi,
        functionName: "calculateReward",
        args: [id, wallet],
      });
      userDetail.userStakedAmout = Number(userDetail[0]) / 10 ** 18;
      userDetail.rewardDetail = Number(rewardDetail[0]) / 10 ** 18;
      console.log("test", rewardDetail);
      userDetail.isStake = userDetail[3];
      console.log(userDetail);
      return userDetail;
    } catch (error) {
      console.error("Error in getUserInfo:", error);
      throw error;
    }
  }

  async approve(amount: any, depositToken: any) {
    try {
      const { hash } = await writeContract({
        address: depositToken,
        abi: RewardContractAbi,
        functionName: "approve",
        args: [environment.STAKING_CONTRACT_ADDRESS, +amount * 10 ** 18],
      });
      const data = await waitForTransaction({
        hash: hash,
      });
      return data;
    } catch (error) {
      console.error("Error in approve:", error);
      throw error;
    }
  }

  async claim(id: any) {
    try {
      const { hash } = await writeContract({
        address: environment.STAKING_CONTRACT_ADDRESS as any,
        abi: ContractAbi,
        functionName: "claimMyReward",
        args: [id],
      });
      const data = await waitForTransaction({
        hash: hash,
      });
      return data;
    } catch (error) {
      console.error("Error in claim:", error);
      throw error;
    }
  }

  async unstake(id: any) {
    try {
      const { hash } = await writeContract({
        address: environment.STAKING_CONTRACT_ADDRESS as any,
        abi: ContractAbi,
        functionName: "withdrawAll",
        args: [id],
      });
      const data = await waitForTransaction({
        hash: hash,
      });
      return data;
    } catch (error) {
      console.error("Error in unstake:", error);
      throw error;
    }
  }

  async getSupply() {
    try {
      const { hash } = await writeContract({
        address: environment.SUPPLY_CONTRACT as any,
        abi: SupplyAbi,
        functionName: "claim",
        args: [],
      });
      const data = await waitForTransaction({
        hash: hash,
      });
      return data;
    } catch (error) {
      console.error("Error in unstake:", error);
      throw error;
    }
  }
}
