"use client";
import {
  Button,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Tooltip,
  Typography,
  notification,
} from "antd";
import React, { useContext, useEffect, useMemo, useState } from "react";

import { motion } from "framer-motion";
import { useForm } from "antd/es/form/Form";
import {
  MIDDLEWARE_HTTP,
  MIDDLEWARE_HTTP_URLS,
  displayVariants,
  formLayout,
  shorternAddress,
} from "@/utils";
import { WalletContext } from "@/context";
import { TopicData } from "@/model/topic";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { Entities }  from "@mlayerprotocol/core";

interface CreateTopicProps {
  isModalOpen?: boolean;
  topicData?: TopicData;
  onCancel?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const CreateTopic = (props: CreateTopicProps) => {
  const { combinedAgents, selectedAgent, createTopic, loaders, agents } =
    useContext(WalletContext);
  const { isModalOpen = false, onCancel, topicData } = props;
  const [form] = useForm();

  const selectedAgentObj = useMemo(() => {
    return combinedAgents.find((opt) => opt.address == selectedAgent);
  }, [combinedAgents, selectedAgent]);

  useEffect(() => {
    form.setFieldsValue({ address: selectedAgentObj?.address, ...topicData });
    try {
      const meta = JSON.parse(String(topicData?.meta ?? ''));
      form.setFieldsValue({  n: meta?.name ?? '', description: meta?.description ?? ''});
    } catch (e) {
      
    }
  }, [topicData, selectedAgentObj]);


  return (
    <Modal
      className="rounded-lg"
      title={null}
      open={isModalOpen}
      // onOk={handleOk}
      onCancel={(e) => {
        form.setFieldsValue({});
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
            className="flex flex-col"
            layout="vertical"
            name="basic"
            form={form}
            initialValues={{ dSubRol: Entities.SubscriberRole.Writer, address: selectedAgentObj?.address, ...topicData }}
            onFinish={(data) => {
              if (!selectedAgentObj?.privateKey) {
                notification.error({
                  message: "Agent Private Key Not Accessable",
                });
                return;
              }

              const name: string = data["n"];
              const description: string = data["description"];
              const ref: string = data["ref"];
              const isPublic: boolean = data["pub"] == true;
              createTopic?.(
                selectedAgentObj,
                name,
                description,
                ref,
                isPublic,
                data['dSubRol'],
                {
                  id: topicData?.id,
                  isUpdate: topicData != undefined,
                  loaderKey: `createTopic-${topicData?.id}`,
                }
              );

              console.log({ data, selectedAgentObj, ref });
              form.setFieldsValue({});
              onCancel?.({} as any);
            }}
            // onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Typography.Title level={3}>{topicData?.id ? 'Update Topic' : 'Create Topic'}</Typography.Title>
            <Form.Item
              label={`Active Agent: `}
              name="address"
              rules={[
                { required: true, message: "Please input select an address!" },
              ]}
            >
              <Input className="!border-[0px] !bg-transparent" placeholder="No agent selected" disabled />
            </Form.Item>

            <Form.Item
              label="Reference Id:"
              name="ref"
              rules={[{ required: true, message: "Please input a reference id!" }]}
            >
              <Input placeholder="e.g com.example.app (no space)" />
            </Form.Item>

            <Form.Item
              label="Name:"
              name="n"
              rules={[{ required: true, message: "Please input your topics name!" }]}
            >
              <Input placeholder="Name of topic" />
            </Form.Item>

            <Form.Item
              label="Description:"
              name="description"
              rules={[{ message: "Please input your description!" }]}
            >
              <Input placeholder="Describe this topic" />
            </Form.Item>
            

            <Form.Item label={<Space><Tooltip title="Public topics can be subscribed to by any device" ><InformationCircleIcon className="w-[16px]"/></Tooltip> <span>Public</span></Space>} name="pub" valuePropName="checked">
            <Switch />
            </Form.Item>

            <Form.Item
              label={ <Space><Tooltip title="Default role assigned to new subscribers" ><InformationCircleIcon className="w-[16px]" /></Tooltip> <span>Default Role</span></Space>}
              name="dSubRol"
              rules={[
                { required: true, message: "Please select default role!" },
              ]}
            >
             <Select defaultValue={Entities.SubscriberRole.Writer} className="w-100" >
                {Object.keys(Entities.SubscriberRole).filter(d=>isNaN(parseInt(d))).map((val, index) => {
                  return (
                    <Select.Option key={index} value={(Entities.SubscriberRole as any)[String(val)]}>
                      {val}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item> 



            <Button
              loading={
                loaders["createTopic"] ||
                loaders[`createTopic-${topicData?.id}`]
              }
              type="primary"
              htmlType="submit"
              className="w-full mt-[28px] self-end"
              shape="round"
            >
              <span className="">
                {topicData ? "Update" : "Create"}
              </span>
            </Button>
          </Form>
        </motion.div>
      </div>
      {/* </div> */}
    </Modal>
  );
};
