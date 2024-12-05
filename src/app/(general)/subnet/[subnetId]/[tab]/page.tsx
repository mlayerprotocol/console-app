"use client";
import React, { useContext, useEffect, useMemo, useState } from "react";

import { MainAuth, WalletMainLayout } from "@/components";
import { WalletContext } from "@/context";
import { Button, Card, Dropdown, MenuProps, Space } from "antd";
import * as HeroIcons from "@heroicons/react/24/solid";
import { shorternAddress, metaToObject, uuidToHexString } from "@/utils";
import { ethers } from "ethers";
import { Bs3Square, BsMenuApp, BsWallet } from "react-icons/bs";
import { MdMore, MdMoreHoriz, MdMoreVert } from "react-icons/md";
import { SubnetAppAsideMobile } from "@/components/layouts/wallet/sidebar/mobile";
import { AnimatePresence } from "framer-motion";
import { TopupSubnet } from "@/components/modals/topup/topup-subnet";
import { useReadContract } from "wagmi";
import { stakeContractConfig } from "@/utils/contracts";
import { keccak256 } from "viem";
import { Utils } from "@mlayerprotocol/core";
// import { TopupSubnet } from "@/components/modals/topup";

const WalletPage = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const {
    selectedAgent,
    setSelectedAgent,
    connectedWallet,
    combinedAgents,
    subnetListModelList,
    setSelectedSubnetId,
    selectedSubnetId,
    selectedSubnet,
  } = useContext(WalletContext);
  const [showSubnetSideMenu, setShowSubnetSideMenu] = useState(false);
  const [showTopUpSubnet, setShowTopUpSubnet] = useState<boolean>(false);
  // const bytes16SelectedSubnetId = useMemo(() => {
  //   return keccak256(`0x${selectedSubnetId}`).slice(0, 34);
  // }, [selectedSubnetId]); // Trim to 16 bytes (0x prefix + 32 hex chars)

  const {
    data: subnetBalance,
    isError,
    isLoading,
    error,
    isLoadingError,
    refetch,
  } = useReadContract({
    ...stakeContractConfig,
    functionName: "subnetBalance",
    args: [uuidToHexString(selectedSubnetId ?? "")],
  });
  useEffect(() => {
    // console.log("--------help");
    console.log({
      subnetBalance,
      isError,
      isLoading,
      error,
      selectedSubnetId,
    });
  }, [
    subnetBalance,
    isError,
    isLoading,
    error,
    isLoadingError,
    selectedSubnetId,
  ]);

  const items: MenuProps["items"] =
    (combinedAgents ?? [])
      .filter((cAgt) => cAgt.privateKey && cAgt.authData)
      .map((item, index) => {
        return {
          key: index,
          label: <span>{shorternAddress(item.address)}</span>,
          onClick: () => {
            setSelectedAgent?.(item.address);
          },
        };
      }) ?? [];

  const subnetItems: MenuProps["items"] =
    subnetListModelList?.data.map((subnet, index) => {
      return {
        key: index,
        label: <span>{metaToObject(subnet.meta)?.name ?? subnet.ref}</span>,
        onClick: () => {
          setSelectedSubnetId?.(subnet.id);
        },
      };
    }) ?? [];
  if (!connectedWallet) {
    return (
      <div className="flex flex-col my-8">
        <Button
          onClick={() => {
            setShowModal((old) => !old);
          }}
          className="self-center"
          type="primary"
          shape="round"
          size="large"
        >
          Connect
        </Button>
        <MainAuth
          isModalOpen={showModal}
          onCancel={() => {
            setShowModal((old) => !old);
          }}
          handleClose={() => setShowModal(false)}
        />
      </div>
    );
  }
  return (
    <>
      <div className="flex flex-col min-h-[70vh] my-6 lg:ml-4">
        <div
          onClick={() => {
            setShowSubnetSideMenu((old) => !old);
          }}
          className="h-12 w-12 bg-secondary rounded-full border border-borderColor lg:hidden flex items-center justify-center cursor-pointer m-6 "
        >
          <MdMoreVert size={20} />
        </div>

        <div className="flex flex-wrap gap-x-2 gap-y-4 px-6 bg-secondaryBg py-4 ">
          <div className="flex items-center">
            <Dropdown
              menu={{ items: subnetItems }}
              className="!border !border-[var(--m-border-color)] p-2 !rounded-md bg-[var(--m-secondary-color)] w-[266px]"
            >
              <Space>
                <span className="dark:text-white text-sm">
                  {selectedSubnet
                    ? [selectedSubnet].map((e) => {
                        return {
                          ...e,
                          name: metaToObject(e.meta)?.name ?? e.ref,
                        };
                      })?.[0]?.name ?? selectedSubnet.ref
                    : "No subnet selected"}{" "}
                  {`[${selectedSubnet?.ref}]`}{" "}
                </span>

                <HeroIcons.ChevronDownIcon className="ml-2 h-[20px]" />
              </Space>
            </Dropdown>
          </div>
          <div className="flex gap-2 justify-between grow lg:grow-0 ml-auto lg:ml-14 items-center text-sm dark:text-white w-auto">
            <span className="flex gap-2">
              <BsWallet size={18} />
              <span className="dark:text-gray-400 ">Subnet Balance:</span>
            </span>
            <span className=" mr-6">
              <b>{ethers.formatEther(String(subnetBalance?.toString() ?? "0"))}</b>{" "}
              MLT
            </span>
            <Button
              ghost
              type="primary"
              shape="round"
              onClick={() => {
                setShowTopUpSubnet(true);
              }}
              className="cursor-pointer"
            >
              + Topup
            </Button>
          </div>
          <Dropdown
            menu={{ items }}
            className="!border !border-[var(--m-border-color)] p-2 !rounded-md bg-[var(--m-secondary-color)] !hidden lg:!inline-flex ml-auto"
          >
            <Space>
              <span className="dark:text-white text-sm">
                {items.length
                  ? shorternAddress(
                      combinedAgents.find((opt) => opt.address == selectedAgent)
                        ?.address ?? ""
                    )
                  : "No approved agents found"}
              </span>

              <HeroIcons.ChevronDownIcon className="ml-2 h-[20px]" />
            </Space>
          </Dropdown>
        </div>
        <WalletMainLayout />
      </div>
      <AnimatePresence>
        {showSubnetSideMenu && (
          <SubnetAppAsideMobile
            setShowSubnetSideMenu={setShowSubnetSideMenu}
            showSubnetSideMenu={showSubnetSideMenu}
          />
        )}
      </AnimatePresence>
      <TopupSubnet
        subnetId={selectedSubnetId}
        isModalOpen={showTopUpSubnet}
        onCancel={() => {
          setShowTopUpSubnet((old) => !old);
          setTimeout(() => {
            refetch();
          }, 3000);
        }}
      />
    </>
  );
};

export default WalletPage;
