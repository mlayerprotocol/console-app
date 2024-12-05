"use client";
import { INFO_LINKS, displayVariants } from "@/utils";
import * as HeroIcons from "@heroicons/react/24/solid";
import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button, Space, Tabs } from "antd";
import { MyTopics } from "./my";
import { SubscribedTopics } from "./subscribed";
import { AllTopics } from "./all";
import { useSearchParams } from "next/navigation";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { PreviewTopic } from "./preview";
import { PendingTopics } from "./pending";
import { SubscribedV2Topics } from "./subscibed-v2";
import { WalletContext } from "@/context";
import { CreateTopic } from "@/components/modals";
interface TopicsProps {
  onSuccess?: (values: any) => void;
  handleCreateAccount?: () => void;
}
export const Topics = (props: TopicsProps) => {
  const searchParams = useSearchParams();
  const [showCreateTopicModal, setShowCreateTopicModal] =
    useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("my");
  const { loaders } = useContext(WalletContext);

  const [selectedTopic, setSelectedTopic] = useState<string>();

  useEffect(() => {
    console.log({ searchParams: searchParams.get("topicTab") });
    setActiveTab(searchParams.get("topicTab") ?? activeTab);
    setSelectedTopic(searchParams.get("id") ?? undefined);
  }, [searchParams]);

  const onChange = (key: string) => {
    console.log({ activeTab, key });
    setActiveTab(key);
  };

  const tabs = [
    {
      label: `My Topics`,
      key: "my",
      children: <MyTopics />,
    },
    {
      label: `Subscribed Topics`,
      key: "sub",
      children: <SubscribedV2Topics />,
    },
    //   {
    //     label: `All Topics`,
    //     key: "all",
    //     children: <AllTopics />,
    //   },
    {
      label: `Pending Topics`,
      key: "pending",
      children: <PendingTopics useSubnet />,
    },
  ];
  return (
    <motion.div
      className="inline-flex w-full flex-col gap-6 py-10 px-7"
      variants={displayVariants}
      initial={"hidden"}
      animate={"show"}
      exit={{
        opacity: 0,
        scale: 0,
      }}
      // transition={{ duration: 1, delay: 1 }}
    >
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex gap-2 items-center">
          <span className=" dark:text-white text-sm">Topics</span>
          <HeroIcons.InformationCircleIcon className="h-[16px] dark:!text-white " />
        </div>
        <span className="dark:text-slate-400 text-xs bg-secondaryBg p-3 max-w-[415px]">
          Topics are communication channels. Every subscriber to a topic
          receives the data/messages sent to that topic.{" "}
          <a href={INFO_LINKS.topicInfo} target="_blank">
            Learn more...
          </a>
        </span>
        <Button
          loading={loaders["createTopic"]}
          onClick={() => {
            setShowCreateTopicModal((old) => !old);
          }}
          className="ml-auto"
          ghost
          type="primary"
          shape="round"
        >
          <span>Create Topic</span>
        </Button>
      </div>
      {!!selectedTopic && <PreviewTopic topicId={selectedTopic} />}

      {!selectedTopic && (
        <div className="flex flex-col">
          <div className="flex gap-4">
            {tabs.map((tab, index) => {
              const active = activeTab == tab.key;
              return (
                <Button
                  key={index}
                  onClick={() => {
                    setActiveTab(tab.key);
                  }}
                  type={active ? "primary" : "default"}
                  // ghost={!active}
                  className={`!rounded-lg ${active ? "" : "!bg-secondaryBg"}`}
                >
                  {tab.label}
                </Button>
              );
            })}
          </div>
          <Tabs
            tabBarStyle={{
              display: "none",
            }}
            onChange={onChange}
            activeKey={activeTab}
            type="card"
            items={tabs}
          />
        </div>
      )}

      <CreateTopic
        isModalOpen={showCreateTopicModal}
        onCancel={() => {
          setShowCreateTopicModal((old) => !old);
          setSelectedTopic(undefined);
        }}
      />
    </motion.div>
  );
};
