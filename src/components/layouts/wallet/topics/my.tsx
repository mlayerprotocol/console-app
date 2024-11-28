"use client";
import { displayVariants, shorternAddress, metaToObject } from "@/utils";
import * as HeroIcons from "@heroicons/react/24/solid";
import * as OutlineHeroIcons from "@heroicons/react/24/outline";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import {
  Button,
  Popconfirm,
  Spin,
  Table,
  TableProps,
  notification,
} from "antd";
import { CreateMessage, CreateTopic } from "@/components";
import { WalletContext } from "@/context";
import { TopicData } from "@/model/topic";

import { PreviewTopic } from "./preview";

import { Address, SubscriberRole } from "@mlayerprotocol/core/src/entities";
import { useRouter } from "next/navigation";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface MyTopicsProps {
  onSuccess?: (values: any) => void;
  handleCreateAccount?: () => void;
}
export const MyTopics = (props: MyTopicsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showCreateTopicModal, setShowCreateTopicModal] =
    useState<boolean>(false);
  const [showCreateMessageModal, setShowCreateMessageModal] =
    useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicData>();
  const _topic = searchParams.get("topic");
  useEffect(() => {
    //
    if (!_topic) {
      setShowPreview(false);
    }
    console.log({ _topic });
  }, [_topic]);
  const {
    loaders,
    accountTopicList,
    setSelectedMessagesTopicId,
    agents,
    selectedAgent,
    walletAccounts,
    connectedWallet,
    selectedSubnetId,
  } = useContext(WalletContext);
  const [selectedTopicId, setSelectedTopicId] = useState<string | undefined>();
  // const [previewTopicId, setPreviewTopicId] = useState<string | undefined>();
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const account = useMemo(
    () => walletAccounts[connectedWallet ?? ""]?.[0],
    [walletAccounts, connectedWallet]
  );

  const dataSource = useMemo(() => {
    return (accountTopicList?.data ?? []).filter(
      (item) =>
        item.snet == selectedSubnetId &&
        item.acct == Address.fromString(String(account)).toAddressString()
    );
  }, [accountTopicList, account]);
  const agent = useMemo(() => {
    return agents.find((opt) => opt.address == selectedAgent);
  }, [agents, selectedAgent]);

  const columns: TableProps<TopicData>["columns"] = useMemo(() => {
    return [
      {
        title: "Id",
        dataIndex: "id",
        key: "id",
        render(value, record, index) {
          return (
            <Link href={`?id=${record?.id}`} scroll={false}>
              {shorternAddress(value)}
            </Link>
          );
        },
      },
      {
        title: "Ref",
        dataIndex: "ref",
        key: "ref",
        render(value, record, index) {
          return `${value}`;
        },
      },
      {
        title: "Name",
        dataIndex: "n",
        key: "n",
        render(value, record, index) {
          return metaToObject(record.meta)?.name ?? value ?? "";
        },
      },
      {
        title: "Default Role",
        dataIndex: "dSubRol",
        key: "dSubRol",
        render(value) {
          return (SubscriberRole as any)[String(value)];
        },
      },
      {
        title: "Public",
        dataIndex: "pub",
        key: "pub",
        render(value, record, index) {
          if (!value) {
            return (
              <OutlineHeroIcons.XCircleIcon className="h-[20px] text-gray-500" />
            );
          }
          return (
            <HeroIcons.CheckCircleIcon className="h-[20px] text-green-500" />
          );
        },
      },
      // {
      //   title: "Subscribers",
      //   dataIndex: "subscribers",
      //   key: "subscribers",
      // },
      // {
      //   title: "MSG Consumed",
      //   dataIndex: "bal",
      //   key: "bal",
      // },
      {
        title: "Action",
        dataIndex: "",
        key: "value",
        render: (text, record) => {
          return (
            <div className="flex gap-6">
              {/* <Popconfirm
                title="Subscribe to topic"
                description="Are you sure to subcribe to this topic?"
                onConfirm={() => {
                  //

                  if (agent) subcribeToTopic?.(agent, record.id);
                }}
                // onCancel={cancel}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="link"
                  loading={loaders[`subcribeToTopic-${record.id}`]}
                >
                  <HeroIcons.PlayCircleIcon className="h-[20px]" />
                </Button>
              </Popconfirm> */}
              {/* <Button
                type="link"
                loading={loaders[`sendMessage-${record.id}`]}
                onClick={async () => {
                  setSelectedTopicId(record.id);
                  setShowCreateMessageModal((old) => !old);
                }}
              >
                <HeroIcons.ChatBubbleOvalLeftEllipsisIcon className="h-[20px]" />
              </Button> */}
              {/* <Button
                type="link"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    `${window.location.protocol}//${window.location.host}/wallet/topics?topicTab=sub&topicId=${record.id}`
                  );
                  notification.info({
                    message: "Invitation Url copied",
                    icon: (
                      <HeroIcons.ArrowUpTrayIcon className="h-[20px] text-green-500" />
                    ),
                  });
                }}
              >
                <HeroIcons.ArrowUpTrayIcon className="h-[20px]" />
              </Button> */}
              <Button
                type="link"
                loading={loaders[`createTopic-${record?.id}`]}
                onClick={async () => {
                  setSelectedTopic(record);
                  setShowCreateTopicModal((old) => !old);
                }}
              >
                <HeroIcons.PencilIcon className="h-[20px]" />
              </Button>
              {/* <Button type="link">
                <HeroIcons.XMarkIcon className="h-[20px]" />
              </Button> */}
              <Button
                type="link"
                onClick={async () => {
                  // setPreviewTopicId(record.id);
                  router.push(`?id=${record?.id}`, { scroll: false });
                }}
              >
                <HeroIcons.Bars4Icon className="h-[20px]" />
              </Button>
            </div>
          );
        },
      },
    ];
  }, [accountTopicList]);
  console.log({ account });

  return (
    <motion.div
      className="inline-flex w-full flex-col gap-6"
      variants={displayVariants}
      initial={"hidden"}
      animate={"show"}
      exit={{
        opacity: 0,
        scale: 0,
      }}
      // transition={{ duration: 1, delay: 1 }}
    >
      {/* <Button
        loading={loaders["createTopic"]}
        onClick={() => {
          setShowCreateTopicModal((old) => !old);
        }}
        className="self-end"
        ghost
        type="primary"
        shape="round"
      >
        <span>Create Topic</span>
      </Button> */}
      <Table
        // bordered
        dataSource={dataSource}
        columns={columns}
        loading={loaders["getAccountSubscriptions"]}
      />
      <CreateTopic
        topicData={selectedTopic}
        isModalOpen={showCreateTopicModal}
        onCancel={() => {
          setShowCreateTopicModal((old) => !old);
          setSelectedTopic(undefined);
        }}
      />
      <CreateMessage
        isModalOpen={showCreateMessageModal}
        topicId={selectedTopicId}
        onCancel={() => {
          setShowCreateMessageModal((old) => !old);
        }}
      />
    </motion.div>
  );
};
