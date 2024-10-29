"use client";
import { CreateSubnet } from "@/components";
import { WalletContext } from "@/context";
import { INFO_LINKS, metaToObject } from "@/utils";
import * as HeroIcons from "@heroicons/react/24/solid";
import { Button, Card, Space, Empty, Spin, Checkbox } from "antd";
import { useRouter } from "next/navigation";
import React, { useContext, useState } from "react";
import Link from "next/link";
import { Footer } from "antd/es/layout/layout";
import { FaClock } from "react-icons/fa";
import {
  BsCheckCircle,
  BsCheckCircleFill,
  BsClock,
  BsPlus,
  BsPlusCircle,
  BsPlusCircleFill,
} from "react-icons/bs";
import { MdCheckBox } from "react-icons/md";
import ConnectWalletGuard from "@/components/layouts/guards/connectwalletguard";

const SubnetPage = () => {
  const router = useRouter();

  const [showCreateSubnetModal, setShowCreateSubnetModal] =
    useState<boolean>(false);
  const {
    subnetListModelList,
    setSelectedSubnetId,
    selectedSubnetId,
    loaders,
  } = useContext(WalletContext);
  return (
    <>
    <ConnectWalletGuard>
    <div className="flex flex-col gap-4 min-h-[70vh] my-16 md:my-20 mx-5 md:mx-10">
      <div className="flex gap-4 items-center mb-12 flex-wrap">
        <div className="flex gap-2">
          <span className=" dark:text-white text-bold text-sm">Subnets</span>
          <HeroIcons.InformationCircleIcon className="h-[16px] dark:!text-white " />
        </div>
        <span className=" dark:text-grey text-xs bg-secondaryBg p-3 max-w-[515px]">
          Subnets allow you separate projects into dedicated environments.
          Create a subnet for each project you build on mLayer.{" "}
          <Link target="_blank" href={INFO_LINKS.subnetInfo}>
            Learn more...
          </Link>
        </span>
        <Button
          shape="round"
          type="primary"
          ghost
          href={"/pending-topic"}
          className="font-bold text-sm !text-[#AEB9E1] !border-[#AEB9E1] ml-auto"
        >
          <div className="flex gap-2 items-center">
            <BsClock />
            <span>Pending Invitations</span>
          </div>
        </Button>
      </div>

      <CreateSubnet
        isModalOpen={showCreateSubnetModal}
        onCancel={() => {
          setShowCreateSubnetModal((old) => !old);
        }}
      />

      {/* {subnetListModelList?.data?.length == 0 && (
        <Empty description="No subnet created" />
      )} */}
      <div className="grid grid-cols-12 gap-4">
        {subnetListModelList?.data?.map((subnet, index) => {
          const enabled = subnet.st == 1;
          const selected = subnet.id == selectedSubnetId;

          return (
            <Card
              onClick={() => {
                setSelectedSubnetId?.(subnet.id);
                router.push(`subnet/${subnet.id}/agents`, { scroll: false });
              }}
              className="border-b-5 !border-b-mainLightColor  cursor-pointer  col-span-12 lg:col-span-4"
              key={index}
              // bordered={subnet.id == selectedSubnetId}
            >
              <div className="flex justify-between">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-[#51B6B8] rounded flex justify-center items-center text-2xl font-bold text-white">
                    {(subnet?.ref ?? "").substring(0, 1).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-bold dark:text-white">
                      {subnet?.ref ?? ""}
                    </span>
                    <span className="text-lg">
                      {metaToObject(subnet?.meta)?.name ?? ""}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {enabled ? (
                    <span className="relative flex flex-end h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-100 opacity-50"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-300  opacity-60"></span>
                    </span>
                  ) : (
                    <span className="relative flex flex-end h-3 w-3">
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-500"></span>
                    </span>
                  )}
                  {selected && (
                    <BsCheckCircleFill className="!text-mainLightColor" />
                  )}
                </div>
              </div>
            </Card>
          );
        })}
        <div
          onClick={() => {
            setShowCreateSubnetModal((old) => !old);
          }}
          className="col-span-12 lg:col-span-4 h-[102px] flex gap-2 items-center rounded justify-center border-mainLightColor border border-dashed cursor-pointer"
        >
          {loaders["createSubnet"] == true ? <Spin /> : <BsPlusCircleFill />}
          <span>Create New Subnet</span>
        </div>
      </div>
      </div>
      </ConnectWalletGuard>
      </>
  );
};

export default SubnetPage;
