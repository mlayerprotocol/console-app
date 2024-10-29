"use client";
import { INFO_LINKS, displayVariants, shorternAddress } from "@/utils";
import * as HeroIcons from "@heroicons/react/24/solid";
import React, { useContext, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button, Table, TableProps, notification } from "antd";
import { AuthorizeAgent, NewAgent, PrivateKey } from "@/components";
import { WalletContext } from "@/context";
import moment from "moment";
import { Entities }  from "@mlayerprotocol/core";

interface AgentsProps {
  onSuccess?: (values: any) => void;
  handleCreateAccount?: () => void;
}
export const Agents = (props: AgentsProps) => {
  const [authAddress, setAuthAddress] = useState<AddressData>();
  const [updateAddressData, setUpdateAddressData] = useState<AddressData>();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showPrivateKeyModal, setShowPrivateKeyModal] =
    useState<boolean>(false);
  const [showNewAgentModal, setShowNewAgentModal] = useState<boolean>(false);

  const [selectedAgent, setSelectedAgent] = useState<AddressData>();
  const {
    initialLoading,
    combinedAgents,
    // authenticationList,
    generateAgent,
    loaders,
  } = useContext(WalletContext);
console.log("COMBINEAGENT", combinedAgents.length)
  const dataSource = useMemo(() => {
    return combinedAgents.map((kp: AddressData, index) => {
      // console.log(index, kp.address, authenticationData);
      return {
        ...kp,
        key: index,
        // role: "--",
        role: kp.authData ? (
          Entities.AuthorizationPrivilege[kp.authData?.privi ?? 0]
        ) : (
          <i>Not Authorized</i>
        ),

        expires: kp.authData ? (
          (kp.authData?.du ?? 0) == 0 ? (
            "Never"
          ) : (
            moment(
              new Date((kp.authData?.ts ?? 0) + (kp.authData?.du ?? 0))
            ).fromNow()
          )
        ) : (
          <i>Not Authorized</i>
        ),
      } as any;
    });
  }, [combinedAgents]);

  const columns: TableProps<AddressData>["columns"] = [
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (text) => {
        return <>{shorternAddress(text)}</>;
      },
    },
    {
      title: "Private Key",
      dataIndex: "privateKey",
      key: "privateKey",
      render: (text, record) => {
        if (!record.privateKey) {
          return (
            <Button
              onClick={() => {
                setSelectedAgent(record);
                setShowPrivateKeyModal((old) => !old);
              }}
              type="dashed"
              shape="round"
            >
              <div className="flex gap-2">
                <span>Import Private Key</span>
                <HeroIcons.KeyIcon className="h-[20px]" />
              </div>
            </Button>
          );
        }
        return (
          <Button
            onClick={() => {
              navigator.clipboard.writeText(text);
              notification.open({ message: "Key Copied" });
            }}
            type="link"
            shape="round"
          >
            <div className="flex gap-2">
              <span>******</span>
              <HeroIcons.DocumentDuplicateIcon className="h-[20px]" />
            </div>
          </Button>
        );
      },
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Expires",
      dataIndex: "expires",
      key: "expires",
    },
    {
      title: "Action",
      dataIndex: "address",
      key: "action",
      render: (text, record) => {
        return (
          <div className="flex gap-6">
            <HeroIcons.PencilIcon
              className="h-[20px] cursor-pointer"
              onClick={() => {
                setUpdateAddressData(record);
                setShowModal((old) => !old);
              }}
            />
          </div>
        );
      },
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
          <span className=" dark:text-white text-sm">Agents</span>
          <HeroIcons.InformationCircleIcon className="h-[16px] dark:!text-white " />
        </div>
        <span className="dark:text-slate-400 text-sm bg-secondaryBg p-3 max-w-[415px]">
          Agents act on behalf of Accounts on the mLayer network. This is
          important for security and flexibility. For example, a compromised
          agent can quickly be deauthorized to prevent further attack.{" "}
          <a href={INFO_LINKS.agentInfo}>Learn more...</a>
        </span>
        <Button
          onClick={() => {
            //
            // generateAgent?.();
            setShowNewAgentModal((old) => !old);
          }}
          className="ml-auto"
          ghost
          type="primary"
          shape="round"
        >
          <div className="flex gap-2 items-center">
            <HeroIcons.PlusIcon className="h-[20px]" />
            Add Agent
          </div>
        </Button>
      </div>

      <Table
        dataSource={dataSource}
        columns={columns}
        // bordered
      />
      <AuthorizeAgent
        updateAddressData={updateAddressData}
        addressData={authAddress}
        isModalOpen={showModal}
        onCancel={() => {
          setShowModal((old) => !old);
          setAuthAddress(undefined);
          setUpdateAddressData(undefined);
        }}
      />
      {selectedAgent && (
        <PrivateKey
          addressData={selectedAgent}
          isModalOpen={showPrivateKeyModal}
          onCancel={() => {
            setShowPrivateKeyModal((old) => !old);
          }}
        />
      )}

      <NewAgent
        isModalOpen={showNewAgentModal}
        onCancel={() => {
          setShowNewAgentModal((old) => !old);
        }}
        onAuth={(authAddress) => {
          setAuthAddress(authAddress);
          setShowModal(true);
        }}
      />
    </motion.div>
  );
};
