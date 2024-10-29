"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import React, { useContext } from "react";
import {
  MdBroadcastOnPersonal,
  MdHomeFilled,
  MdOutlineCardGiftcard,
  MdSearch,
} from "react-icons/md";
import { WalletContext } from "@/context";
import { Avatar, Button, Input, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { shorternAddress } from "@/utils";

const MotionButton = motion(Button);

interface AppAsideMobileProps {
  setShowMobileMenu: React.Dispatch<React.SetStateAction<boolean>>;
  showMobileMenu: boolean;
  setShowAuthenticationModal: React.Dispatch<React.SetStateAction<boolean>>;
  showAuthenticationModal: boolean;
}
export const AppAsideMobile = (props: AppAsideMobileProps) => {
  const {
    setShowMobileMenu,
    showAuthenticationModal,
    setShowAuthenticationModal,
  } = props;
  const {
    connectedWallet,
    walletAccounts,
    selectedSubnetId,
    disconnectKeplr,
    initializeKeplr,
    intializeMetamask,
  } = useContext(WalletContext);
  const pathname = usePathname();
  console.log({ pathname });
  return (
    <div className="bg-black bg-opacity-30  absolute z-50">
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        exit={{ x: -300 }}
        className="w-svw h-svh grid  grid-cols-3"
      >
        <div className="bg-secondaryBg px-7 py-20 flex flex-col h-full col-span-2">
          {!(connectedWallet && walletAccounts[connectedWallet]?.[0]) && (
            <MotionButton
              type="primary"
              shape="round"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              onClick={() => {
                setShowAuthenticationModal((old) => !old);
              }}
              className="h-[50px] flex justify-center items-center  mb-12"
            >
              <Typography.Text className=" !text-white text-nowrap">
                Connect Wallet
              </Typography.Text>
            </MotionButton>
          )}

          {connectedWallet && walletAccounts[connectedWallet]?.[0] && (
            <motion.a
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="h-[40px] rounded-full border border-[var(--m-border-color)] bg-[var(--m-secondary-color)] dark:!text-white text-nowrap flex gap-2 justify-center items-center px-2 mb-12"
            >
              <>
                <Avatar
                  size={28}
                  // className="dark:!bg-[#CBD5E1] !border-0"
                  src={`/icons/${connectedWallet}.svg`}
                  icon={<UserOutlined />}
                />
                <span className="text-sm">
                  {shorternAddress(walletAccounts[connectedWallet]?.[0] ?? "")}
                </span>
              </>
            </motion.a>
          )}

          <Input
            className=" mb-7"
            prefix={<MdSearch size={20} className="text-red-50" />}
            placeholder="Search by Account, Agent, Event Hash"
          />
          <Link
            className={`${
              pathname == "/"
                ? "border-l-2 border-l-mainLightColor bg-[var(--m-background-color)] dark:!text-white"
                : ""
            }  p-4 rounded font-bold  hover:text-gray-300 bg-red flex items-center gap-2`}
            href={"/"}
            onClick={() => {
              setShowMobileMenu((old) => !old);
            }}
          >
            <MdHomeFilled size={20} />
            <span>Home</span>
          </Link>

          <Link
            className={`${
              pathname.indexOf("/subnet") == 0
                ? "border-l-2 border-l-mainLightColor bg-[var(--m-background-color)] dark:!text-white"
                : ""
            }  p-4 rounded font-bold  hover:text-gray-300 bg-red flex items-center gap-2`}
            href={"/subnet"}
            onClick={() => {
              setShowMobileMenu((old) => !old);
            }}
          >
            <MdBroadcastOnPersonal size={20} />
            <span>Subnets</span>
          </Link>

          {!process.env.NEXT_PUBLIC_HIDE_AIRDROP && (
            <Link
              className={`${
                pathname == "/airdrop"
                  ? "border-l-2 border-l-mainLightColor bg-[var(--m-background-color)] dark:!text-white"
                  : ""
              }  p-4 rounded font-bold  hover:text-gray-300 bg-red flex items-center gap-2`}
              href={"/airdrop"}
              onClick={() => {
                setShowMobileMenu((old) => !old);
              }}
            >
              <MdOutlineCardGiftcard size={20} />
              <span>Airdrop</span>
            </Link>
          )}
        </div>
        <div
          className="h-full col-span-1 "
          onClick={() => setShowMobileMenu?.((old) => !old)}
        ></div>
      </motion.div>
    </div>
  );
};
