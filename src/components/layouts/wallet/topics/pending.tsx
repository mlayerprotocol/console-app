"use client";
import { displayVariants, metaToObject, shorternAddress } from "@/utils";
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
import { CreateMessage, CreateTopic, JoinTopic } from "@/components";
import { WalletContext } from "@/context";
import { TopicData, TopicListModel } from "@/model/topic";
import { useSearchParams } from "next/navigation";
import {
  Address,
  AuthorizationPrivilege,
  SubscriptionStatus,
} from "@mlayerprotocol/core/src/entities";
import { Entities }  from "@mlayerprotocol/core";
import Link from "next/link";
const status = SubscriptionStatus.Invited;
interface PendingTopicsProps {
  onSuccess?: (values: any) => void;
  handleCreateAccount?: () => void;
  useSubnet?: boolean;
}
export const PendingTopics = (props: PendingTopicsProps) => {
  const { useSubnet = false } = props;
  const [showCreateTopicModal, setShowCreateTopicModal] =
    useState<boolean>(false);
  const [showJoinTopicModal, setShowJoinTopicModal] = useState<boolean>(false);
  const [showCreateMessageModal, setShowCreateMessageModal] =
    useState<boolean>(false);
  const [urlTopicId, setUrlTopicId] = useState<string>();
  const [toggleState1, setToggleState1] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log({ searchParams: searchParams.get("topicId") });
    setUrlTopicId(searchParams.get("topicId") ?? "");
  }, [searchParams]);

  useEffect(() => {
    console.log({ urlTopicId });
    if (!urlTopicId) return;
    setShowJoinTopicModal((old) => !old);
  }, [urlTopicId]);
  const {
    loaders,
    recordTopicList,
    getRecordTopicV2,
    agents,
    selectedAgent,
    authorizeAgent,
    subcribeToTopic,
    walletAccounts,
    connectedWallet,
    selectedSubnetId,
  } = useContext(WalletContext);
  const [selectedTopicId, setSelectedTopicId] = useState<string | undefined>();

  const account = useMemo(
    () => walletAccounts[connectedWallet ?? ""]?.[0],
    [walletAccounts, connectedWallet]
  );

  useEffect(() => {
    if (!connectedWallet) return;
    const params: Record<string, any> = {
      sub: Address.fromString(
        String(walletAccounts[connectedWallet]?.[0])
      ).toAddressString(),
      status,
    };
    if (useSubnet) {
      params["snet"] = selectedSubnetId;
    }
    getRecordTopicV2?.(status, {
      params,
    });
  }, [walletAccounts, connectedWallet, toggleState1]);

  const topicListModel = useMemo<TopicListModel | undefined>(
    () => recordTopicList?.[status],
    [recordTopicList]
  );
  const dataSource = useMemo(() => {
    return topicListModel?.data?.map((kp: TopicData, index) => {
      // console.log(index, kp.address, authenticationData);
      return {
        ...kp,
        key: index,
      } as any;
    });
  }, [recordTopicList]);

  const columns: TableProps<TopicData>["columns"] = useMemo(() => {
    return [
      {
        title: "Hash",
        dataIndex: "h",
        key: "address",
        render(value, record, index) {
          return shorternAddress(value);
        },
      },
      {
        title: "Title",
        dataIndex: "",
        key: "value",
        render: (text, record) => {
          return (
            <span className="text-lg">
              {metaToObject(record?.meta)?.name ?? ""}
            </span>
          );
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

      {
        title: "Action",
        dataIndex: "",
        key: "value",
        render: (text, record) => {
          return (
            <div className="flex gap-6">
              <Popconfirm
                title="Accept"
                description="Are you sure?"
                icon={
                  <HeroIcons.QuestionMarkCircleIcon className="h-[20px] text-green-500 mr-1" />
                }
                onConfirm={() => {
                  //
                  // if (agent) subcribeToTopic?.(agent, record.id);
                  const agent: AddressData =
                    agents.find((agt) => agt.address == selectedAgent) ??
                    agents[0];
                  authorizeAgent?.(
                    agent,
                    0,
                    AuthorizationPrivilege.Member,
                    record.snet
                  ).then((e) => {
                    subcribeToTopic?.(agent, {
                      subnetId: record.snet,
                      topicId: record.id,
                      sub: account,
                      status: Entities.SubscriptionStatus.Subscribed,
                      rol: record.dSubRol,
                    }).then((e) => {
                      setToggleState1((old) => !old);
                    });
                  });
                }}
                // onCancel={cancel}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="primary"
                  shape="round"
                  loading={loaders[`subcribeToTopic-${record.id}`]}
                >
                  Accept
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Decline"
                description="Are you sure?"
                onConfirm={() => {
                  //
                  // if (agent) subcribeToTopic?.(agent, record.id);
                  const agent: AddressData =
                    agents.find((agt) => agt.address == selectedAgent) ??
                    agents[0];
                  authorizeAgent?.(
                    agent,
                    0,
                    AuthorizationPrivilege.Guest,
                    record.snet
                  ).then((e) => {
                    subcribeToTopic?.(agent, {
                      subnetId: record.snet,
                      topicId: record.id,
                      sub: account,
                      rol: record.dSubRol,
                      status: Entities.SubscriptionStatus.Unsubscribed,
                    }).then((e) => {
                      setToggleState1((old) => !old);
                    });
                  });
                }}
                // onCancel={cancel}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="primary"
                  shape="round"
                  danger
                  loading={loaders[`subcribeToTopic-${record.id}`]}
                >
                  Reject
                </Button>
              </Popconfirm>
              {/* <Button
                type="link"
                loading={loaders[`sendMessage-${record.id}`]}
                onClick={async () => {
                  setSelectedTopicId(record.id);
                  setShowCreateMessageModal((old) => !old);
                }}
              >
                <HeroIcons.ChatBubbleOvalLeftEllipsisIcon className="h-[20px]" />
              </Button>
              <Button
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
              </Button>
              
              <Button type="link">
                <HeroIcons.XMarkIcon className="h-[20px]" />
              </Button> */}
            </div>
          );
        },
      },
    ];
  }, [topicListModel]);

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
      <div className="flex gap-4 justify-between mt-10">
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
        <Link href="/subnet" className="self-start" type="text">
          <HeroIcons.ArrowLeftIcon className="ml-2 h-[20px]" />
        </Link>
        <Button
          loading={loaders["subcribeToTopic"]}
          onClick={() => {
            setShowJoinTopicModal((old) => !old);
          }}
          className="self-end"
          type="primary"
          shape="round"
        >
          <span>Join Topic</span>
        </Button>
      </div>

      <Table
        // bordered
        dataSource={dataSource}
        columns={columns}
        loading={loaders["getAccountSubscriptions"]}
      />

      <CreateMessage
        isModalOpen={showCreateMessageModal}
        topicId={selectedTopicId}
        onCancel={() => {
          setShowCreateMessageModal((old) => !old);
        }}
      />
      <JoinTopic
        isModalOpen={showJoinTopicModal}
        onCancel={() => {
          setShowJoinTopicModal((old) => !old);
          setUrlTopicId(undefined);
        }}
        topicId={urlTopicId}
      />
    </motion.div>
  );
};
