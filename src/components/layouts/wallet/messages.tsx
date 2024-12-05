"use client";
import { ML_ACCOUNT_DID_STRING, displayVariants, metaToObject, shorternAddress } from "@/utils";
import React, { useContext, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CreateMessage, CreateTopic } from "@/components";
import { WalletContext } from "@/context";
import { Button, Dropdown, MenuProps, Space, Table } from "antd";
import * as HeroIcons from "@heroicons/react/24/solid";
import moment from "moment";
import { Address } from "@mlayerprotocol/core/src/entities";
interface MessagesProps {
  topicId: string;
  onSuccess?: (values: any) => void;
  handleCreateAccount?: () => void;
}
export const Messages = (props: MessagesProps) => {
  const [showCreateMessageModal, setShowCreateMessageModal] =
    useState<boolean>(false);
  const {
    loaders,
    accountTopicList,
    selectedSubnetId,
    walletAccounts,
    connectedWallet,
    selectedMessagesTopicId,
    messagesList,
    setSelectedMessagesTopicId,
  } = useContext(WalletContext);
  const { topicId } = props;
  const account = useMemo(
    () => walletAccounts[connectedWallet ?? ""]?.[0],
    [walletAccounts, connectedWallet]
  );
  const  accountAsAddress = Address.fromString(account as string).toAddressString()
  const topic = useMemo(() => {
    if (!selectedMessagesTopicId && (accountTopicList?.data ?? []).length > 0) {
      setTimeout(() => {
        setSelectedMessagesTopicId?.((accountTopicList?.data ?? []).find(d=>d.id==topicId)?.id);
      }, 2000);
      return undefined;
    }
    return (accountTopicList?.data ?? []).find(
      (v) =>
        v.snet == selectedSubnetId &&
        v.acct == accountAsAddress &&
        v.id == selectedMessagesTopicId
    );
  }, [topicId, accountTopicList]);

  

  const dataSource = useMemo(() => {
    return (messagesList?.data ?? []).map((msg, index) => {
      return {
        key: index,
        sender: msg.s,
        message: msg.d,
        id: msg.id,
        agent: msg.agt,
        date: moment(new Date(msg.ets)).fromNow(),
      };
    });
  }, [selectedMessagesTopicId, messagesList]);

  return (
    <motion.div
      className="inline-flex flex-col w-full gap-6 py-8"
      variants={displayVariants}
      initial={"hidden"}
      animate={"show"}
      exit={{
        opacity: 0,
        scale: 0,
      }}
      // transition={{ duration: 1, delay: 1 }}
    >
      <div className="flex justify-end">
        <Button
          loading={loaders["sendMessage"]}
          onClick={() => {
            setShowCreateMessageModal((old) => !old);
          }}
          className=""
          ghost
          type="primary"
          shape="round"
        >
          <span>Send Message</span>
        </Button>
      </div>
      <Table
        loading={loaders["getTopicMessages"]}
        dataSource={dataSource}
        columns={columns}
      />

      <CreateMessage
        isModalOpen={showCreateMessageModal}
        topicId={selectedMessagesTopicId}
        onCancel={() => {
          setShowCreateMessageModal((old) => !old);
        }}
      />
    </motion.div>
  );
};

const columns = [
  {
    title: "Id",
    dataIndex: "id",
    key: "id",
    render: (text: any) => {
      return <span>{shorternAddress(text ?? '')}</span>;
    },
  },
  {
    title: "Device",
    dataIndex: "agent",
    key: "agt",
    render: (text: any) => {
      return <span>{shorternAddress(text ?? '')}</span>;
    },
  },
  {
    title: "Account",
    dataIndex: "sender",
    key: "sender",
    render: (text: any) => {
      return <span>{shorternAddress(text)}</span>;
    },
  },
  {
    title: "Message",
    dataIndex: "message",
    key: "message",
    render: (text: any) => {
      return <span>{Buffer.from(text, "hex").toString()}</span>;
    },
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
  },
];
