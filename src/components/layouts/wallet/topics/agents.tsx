"use client";
import {
  INFO_LINKS,

  displayVariants,
  shorternAddress,
} from "@/utils";
import * as HeroIcons from "@heroicons/react/24/solid";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button, Space, Table, TableProps, notification } from "antd";
import { AuthorizeAgent, JoinTopic, NewAgent, PrivateKey } from "@/components";
import { WalletContext } from "@/context";
import moment from "moment";
import { AddAgentToTopic } from "@/components/modals/topics/add-agent-to-topic";
import { Entities }  from "@mlayerprotocol/core";
import { SubscriberData, SubscriberListModel } from "@/model/subscribers";

interface TopicAgentsProps {
  topicId: string;
  onSuccess?: (values: any) => void;
  handleCreateAccount?: () => void;
}
export const TopicAgents = (props: TopicAgentsProps) => {
  const [authAddress, setAuthAddress] = useState<AddressData>();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [toggleState1, setToggleState1] = useState(false);
  const [showPrivateKeyModal, setShowPrivateKeyModal] =
    useState<boolean>(false);
  const { topicId } = props;

  const {
    walletAccounts,
    connectedWallet,
    // combinedAgents,
    // authenticationList,
    getTopicSubscribers,
    subscriberTopicList,
    loaders,
  } = useContext(WalletContext);

  useEffect(() => {
    if (!connectedWallet) return;
    getTopicSubscribers?.(topicId, {
      params: {
        // acct: Address.fromString(
        //   walletAccounts[connectedWallet]?.[0]
        // ).toAddressString(),
        top: topicId,
      },
    });
  }, [walletAccounts, connectedWallet, topicId, toggleState1]);

  const subscriberListModel = useMemo<SubscriberListModel | undefined>(
    () => subscriberTopicList?.[topicId],
    [subscriberTopicList, topicId]
  );

  const dataSource = useMemo(() => {
    return subscriberListModel?.data.map((kp: SubscriberData, index) => {
      // console.log(index, kp.address, authenticationData);
      return {
        ...kp,
        key: index,
      } as any;
    });
  }, [subscriberListModel]);

  const columns: TableProps<SubscriberData>["columns"] = [
    {
      title: "Subscriber",
      dataIndex: "sub",
      key: "sub",
      render: (text) => {
        return <>{shorternAddress(text)}</>;
      },
    },
    {
      title: "Role",
      dataIndex: "rol",
      key: "rol",
      render: (_, record) => {
        return (
          <div className="flex gap-6">
            {/* {Object.keys(Entities.SubscriptionStatus).filter((k)=>Entities.SubscriptionStatus[k] == Object.values(EntitiesSubscriptionStatus)[record.st]==} */}
             {Entities.SubscriberRole[record.rol]}
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "st",
      key: "st",
      render: (_, record) => {
        return (
          <div className="flex gap-6">
            {/* {Object.keys(Entities.SubscriptionStatus).filter((k)=>Entities.SubscriptionStatus[k] == Object.values(EntitiesSubscriptionStatus)[record.st]==} */}
             {Entities.SubscriptionStatus[record.st]}
          </div>
        );
      },
    },

    {
      title: "Time",
      dataIndex: "ts",
      key: "ts",
      render: (text, record) => {
        return <>{moment(record.ts).fromNow()}</>;
      },
    },
    // {
    //   title: "Updated",
    //   dataIndex: "UpdatedAt",
    //   key: "updatedAt",
    //   render: (text, record) => {
    //     return <>{moment(record.UpdatedAt).fromNow()}</>;
    //   },
    // },
  ];

  return (
    <motion.div
      className="inline-flex w-full flex-col gap-6 py-8"
      variants={displayVariants}
      initial={"hidden"}
      animate={"show"}
      exit={{
        opacity: 0,
        scale: 0,
      }}
      // transition={{ duration: 1, delay: 1 }}
    >
      <Space>
        <HeroIcons.InformationCircleIcon className="w-[32px]" />
        <span className="text-xs text-gray-500 ml-10">
          Subscribers are accounts or devices that can read from and publish messages to topics.{' '}
          <a href={INFO_LINKS.subscribers}>Learn more...</a>
        </span>
      </Space>
      <div className="flex gap-4 justify-end">
        {/* <Button
          onClick={() => {
            setShowModal((old) => !old);
          }}
          loading={loaders["authorizeAgent"]}
          className="self-end"
          ghost
          type="primary"
          shape="round"
        >
          <span>Authorize Agent</span>
        </Button> */}

        <Button
          onClick={() => {
            //
            // generateAgent?.();
            setShowModal((old) => !old);
          }}
          className=""
          ghost
          type="primary"
          shape="round"
        >
          {/* <HeroIcons.PlusCircleIcon className="h-[20px]" /> */}
          Add Subscriber
        </Button>
      </div>
      <Table dataSource={dataSource} columns={columns} />
      <AddAgentToTopic
        isModalOpen={showModal}
        onCancel={() => {
          setShowModal((old) => !old);
          // setUrlTopicId(undefined);
          setTimeout(() => {
            setToggleState1((old) => !old);
          }, 5000);
        }}
        topicId={topicId}
      />
    </motion.div>
  );
};
