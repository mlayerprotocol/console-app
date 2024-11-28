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
  displayVariants,
  formLayout,
  shorternAddress,
  STAKE_CONTRACT_ADDRESS,
} from "@/utils";
import { WalletContext } from "@/context";
import { readContract } from "viem/actions";
import { stakeContractConfig, tokenContractConfig } from "@/utils/contracts";
import { useContractRead, useContractWrite } from "wagmi";

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

  // const { data, isSuccess, writeContract } = useContractWrite({
  //   ...tokenContractConfig,
  //   async (params:type) => {

  //   }
  // })

  const {
    data: minStakableData,
    isError,
    isLoading,
    error,
    isLoadingError,
  } = useContractRead({
    ...stakeContractConfig,
    functionName: "minStakable",
  });

  useEffect(() => {
    // console.log("--------help");
    console.log({ minStakableData, isError, isLoading, error });
  }, [minStakableData, isError, isLoading, error, isLoadingError]);

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
            onFinish={(data) => {
              const amount: string = data["amount"];
              // const subnetId: string = data["subnetId"];

              console.log({ data });
              // form.setFieldsValue({});
              // onCancel?.({} as any);
            }}
            // onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="Amount :"
              extra={<>{`Min Stake Value : ${minStakableData ?? ""} `}</>}
              name="amount"
              rules={[
                { required: true, message: "Please input your message!" },
              ]}
            >
              <InputNumber placeholder="Enter an amount" min={100} />
            </Form.Item>

            <Button
              // loading={loaders["sendMessage"]}
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
