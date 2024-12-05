import { Abi, Address } from "abitype";
import { ML_TOKEN_CONTRACT_ADDRESS, STAKE_CONTRACT_ADDRESS } from "./constants";
import { SubnetAbi } from "@/abi/Subnet";
import { erc20Abi } from "viem";

export const stakeContractConfig = {
  address: STAKE_CONTRACT_ADDRESS as Address,
  abi: SubnetAbi as Abi,
};

export const tokenContractConfig = {
  address: ML_TOKEN_CONTRACT_ADDRESS as Address,
  abi: erc20Abi as Abi,
};
