"use client";
import {
  Button,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  notification,
} from "antd";
import React, { useContext, useEffect, useMemo, useState } from "react";

import { motion } from "framer-motion";
import { useForm } from "antd/es/form/Form";
import {
  delay,
  displayVariants,
  formLayout,
  shorternAddress,
  STAKE_CONTRACT_ADDRESS,
  uuidToHexString,
} from "@/utils";
import { WalletContext } from "@/context";
import { readContract } from "viem/actions";
import { stakeContractConfig, tokenContractConfig } from "@/utils/contracts";
import { useWriteContract, useReadContract, useAccount } from "wagmi";
import { ethers, parseEther } from "ethers";

interface TopupSubnetProps {
  subnetId?: string;
  isModalOpen?: boolean;
  onCancel?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}
export const TopupSubnet = (props: TopupSubnetProps) => {
  const {
    //
  } = useContext(WalletContext);

  const { isModalOpen = false, onCancel, subnetId } = props;
  const [form] = useForm();
  const { address } = useAccount();
  const [isLoadingAwait, setIsLoadingAwait] = useState(false);

  // const { data, isSuccess, writeContract } = useContractWrite({
  //   ...tokenContractConfig,
  //   async (params:type) => {

  //   }
  // })

  // const {
  //   data: minStakableData,
  //   isError,
  //   isLoading,
  //   error,
  //   isLoadingError,
  // } = useContractRead({
  //   ...stakeContractConfig,
  //   functionName: "minStakable",
  // });

  const { data: minStakableData } = useReadContract({
    ...stakeContractConfig,
    functionName: "minStakable",
  });
  const {
    data,
    // isError,
    isPending: isWritePending,
    isSuccess,
    // error,
    writeContract,
  } = useWriteContract();
  const {
    data: allowance,
    isError,
    isLoading,
    isFetching,
    error,
    isLoadingError,
    refetch: reFetchAllowce,
  } = useReadContract({
    ...tokenContractConfig,
    functionName: "allowance",
    args: [address, STAKE_CONTRACT_ADDRESS],
  });
  const {
    data: userBalance,
    // isError,
    // isLoading,
    // isFetching,
    // error,
    // isLoadingError,
    refetch: reFetchUserBalance,
  } = useReadContract({
    ...tokenContractConfig,
    functionName: "balanceOf",
    args: [address],
  });

  useEffect(() => {
    // console.log("--------help");
    console.log({
      userBalance,
      allowance,
      data,
      isError,
      isWritePending,
      isSuccess,
      error,
    });
  }, [userBalance, allowance, isError, isWritePending, isSuccess, error]);

  useEffect(() => {
    form.setFieldsValue({ subnetId });
  }, [subnetId]);

  return (
    <Modal
      className="rounded-lg"
      title={null}
      open={isModalOpen}
      // onOk={handleOk}
      onCancel={(e) => {
        onCancel?.(e);
      }}
      footer={null}
    >
      <div className="flex flex-col">
        <motion.div
          className="inline-block w-full"
          variants={displayVariants}
          initial={"hidden"}
          animate={"show"}
          exit={{
            opacity: 0,
            scale: 0,
          }}
          // transition={{ duration: 1, delay: 1 }}
        >
          <Form
            {...formLayout}
            layout="vertical"
            className="flex flex-col"
            name="basic"
            form={form}
            initialValues={{ subnetId }}
            onFinish={async (data) => {
              const etherAmount: string = String(data["amount"]);
              const weiAmount = parseEther(etherAmount);

              function stake() {
                writeContract(
                  {
                    ...stakeContractConfig,
                    functionName: "stake",
                    args: [uuidToHexString(subnetId ?? ""), weiAmount],
                  },
                  {
                    onSuccess(data, variables, context) {
                      form.setFieldsValue({ amount: "" });
                      onCancel?.({} as any);
                      notification.success({
                        message: "Transaction was successful",
                      });
                    },
                    onError(error, variables, context) {
                      reFetchAllowce();
                      reFetchUserBalance();
                      notification.error({
                        message: error.message,
                      });
                    },
                  }
                );
              }
              setIsLoadingAwait(true);
              await reFetchAllowce();
              await reFetchUserBalance
              await delay(2000); // Wait for 1 seconds
              setIsLoadingAwait(false);
              if ((allowance as bigint) >= weiAmount) {
                stake();
                return;
              } // Returns BigNumber

              writeContract(
                {
                  ...tokenContractConfig,
                  functionName: "approve",
                  args: [STAKE_CONTRACT_ADDRESS, weiAmount],
                },
                {
                  onError(error, variables, context) {
                    console.log({ Reject: error });
                    reFetchAllowce();
                    reFetchUserBalance();
                  },
                  async onSuccess(data, variables, context) {
                    console.log({
                      After: "onSuccess",
                      data,
                      variables,
                      context,
                    });
                    setIsLoadingAwait(true);
                    await delay(3000); // Wait for 2 seconds
                    setIsLoadingAwait(false);
                    stake();
                  },
                }
              );
              // const subnetId: string = data["subnetId"];

              // form.setFieldsValue({});
              // onCancel?.({} as any);
            }}
            // onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <div className="flex justify-between  text-lg mb-2">
              <span>Amount :</span>
              <span
                onClick={() => {
                  form.setFieldsValue({
                    amount:
                      ethers.formatEther(String(userBalance ?? "0")) ?? "",
                  });
                }}
                className="dark:text-gray-500 cursor-pointer"
              >
                {ethers.formatEther(String(userBalance ?? "0")) ?? ""} MLT
              </span>
            </div>
            <Form.Item
              // label={
              //   <div className="flex justify-between">
              //     <span>Amount :</span>
              //     <span>
              //       {ethers.formatEther(String(userBalance ?? "0")) ?? ""}
              //     </span>
              //   </div>
              // }
              extra={
                minStakableData ? (
                  <>{`Minimum : ${
                    ethers.formatEther(String(minStakableData ?? "0")) ?? ""
                  } `}</>
                ) : (
                  <></>
                )
              }
              name="amount"
              rules={[
                { required: true, message: "Please input a valid amount!" },
              ]}
            >
              <InputNumber
                placeholder="Enter an amount"
                min={ethers.formatEther(String(minStakableData ?? "0"))}
              />
            </Form.Item>

            <Button
              loading={isWritePending || isLoadingAwait}
              type="primary"
              htmlType="submit"
              className="w-full mt-[28px] self-end"
              shape="round"
            >
              <span className="">Top Up</span>
            </Button>
          </Form>
        </motion.div>
      </div>
      {/* </div> */}
    </Modal>
  );
};
