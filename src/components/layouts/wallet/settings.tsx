"use client";
import {
  displayVariants,
  formLayout,
  metaToObject,
  shorternAddress,
} from "@/utils";
import React, { useContext, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useForm } from "antd/es/form/Form";
import { WalletContext } from "@/context";
import { Button, Form, Input, Select, notification } from "antd";
import { AuthorizationPrivilege }  from "@mlayerprotocol/core";
interface SettingsProps {
  onSuccess?: (values: any) => void;
  handleCreateAccount?: () => void;
}
export const Settings = (props: SettingsProps) => {
  const [form] = useForm();

  const {
    combinedAgents,
    selectedAgent,
    createSubnet,
    loaders,
    selectedSubnetId,
    subnetListModelList,
  } = useContext(WalletContext);

  const items = (combinedAgents ?? []).filter(
    (cAgt) => cAgt.privateKey && cAgt.authData
  );

  useEffect(() => {
    const selectedSubnet = subnetListModelList?.data.find(
      (opt) => opt.id == selectedSubnetId
    );
    const meta = metaToObject(selectedSubnet?.meta) ?? {};

    form.setFieldsValue({
      n: meta.name,
      ref: selectedSubnet?.ref,
      status: selectedSubnet?.st,
      dAuthPriv: selectedSubnet?.dAuthPriv,
    });
  }, [subnetListModelList, selectedSubnetId]);
  return (
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
      <div className="flex flex-col my-16 mx-5 xl:mx-72">
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
            {...{ ...formLayout }}
            className="flex flex-col"
            layout="vertical"
            name="basic"
            form={form}
            initialValues={{}}
            onFinish={(data) => {
              const name: string = data["n"];
              const ref: string = data["ref"];
              const status: number = data["status"];
              const dAuthPriv: AuthorizationPrivilege = data["dAuthPriv"];
              createSubnet?.({
                name,
                dAuthPriv,
                ref: ref.trim(),
                status,
                update: true,
              });
              console.log({ data });
              form.setFieldsValue({});
            }}
            // onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            {/* <Form.Item
              label={`Agent Address: `}
              name="address"
              rules={[
                { required: true, message: "Please input select an address!" },
              ]}
            >
              <Select>
                {items.map((val, index) => {
                  return (
                    <Select.Option key={index} value={val.address}>
                      {shorternAddress(val.address)}
                    </Select.Option>
                  );
                })}
              </Select>
              
            </Form.Item> */}
            <Form.Item
              label={`Reference Id: `}
              name="ref"
              rules={[{ required: true, message: "Reference Id is required" }]}
            >
              <Input placeholder="e.g com.example.app (no space)" />
            </Form.Item>
            <Form.Item
              label={`Name: `}
              name="n"
              rules={[{ required: true, message: "Please input a name!" }]}
            >
              <Input placeholder="Enter A Name" />
            </Form.Item>

            <Form.Item
              label="Default Privilege:"
              name="dAuthPriv"
              rules={[
                { required: true, message: "Please select an auth privilege!" },
              ]}
            >
              <Select defaultValue={AuthorizationPrivilege.Member}>
                {Object.keys(AuthorizationPrivilege)
                  .filter((d) => isNaN(parseInt(d)))
                  .map((val, index) => {
                    return (
                      <Select.Option
                        key={index}
                        value={(AuthorizationPrivilege as any)[String(val)]}
                      >
                        {val}
                      </Select.Option>
                    );
                  })}
              </Select>
            </Form.Item>

            <Form.Item
              label="Status:"
              name="status"
              rules={[
                { required: true, message: "Please input select a status!" },
              ]}
            >
              <Select>
                {["Disabled", "Running"].map((val, index) => {
                  return (
                    <Select.Option key={index} value={index}>
                      {val}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>

            <Button
              loading={loaders["createSubnet"]}
              type="primary"
              htmlType="submit"
              className=" mt-[28px] w-full"
              shape="round"
            >
              <span className="">Update Settings</span>
            </Button>
          </Form>
        </motion.div>
      </div>
    </motion.div>
  );
};
