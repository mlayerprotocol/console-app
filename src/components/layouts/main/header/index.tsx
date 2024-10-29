"use client";
import {
  Avatar,
  Button,
  Divider,
  Dropdown,
  Input,
  MenuProps,
  Spin,
  Switch,
  Tag,
  Typography,
} from "antd";
import { MdNightlight, MdSearch, MdSunny } from "react-icons/md";
import Image from "next/image";
import React, { useContext, useState } from "react";
import { UserOutlined } from "@ant-design/icons";
import { MainAuth } from "@/components";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/redux/app";
import { AppContext, ThemeContext, WalletContext } from "@/context";
import { NETWORK, clearSessionStorage, shorternAddress } from "@/utils";
import { removeAuthData } from "@/redux/slices";
import * as HeroIcons from "@heroicons/react/24/solid";
import { useDisconnect, } from "wagmi";
// import { setToken } from "@/redux/slices";

const MotionButton = motion(Button);

interface AppHeaderProps {
  headerText?: string;
  setShowMobileMenu: React.Dispatch<React.SetStateAction<boolean>>;
  showMobileMenu: boolean;
  setShowAuthenticationModal: React.Dispatch<React.SetStateAction<boolean>>;
  showAuthenticationModal: boolean;
}
export const AppHeader = (props: AppHeaderProps) => {
  const {
    headerText = "STUDIO",
    showMobileMenu,
    setShowMobileMenu,
    showAuthenticationModal,
    setShowAuthenticationModal,
  } = props;
  // const [showAuthenticationModal, setShowAuthenticationModal] = useState<boolean>(false);
  // const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const { initialLoading } = useContext(AppContext);
  const { themeType, toggleTheme } = useContext(ThemeContext);
  const { disconnect } = useDisconnect()

  const {
    connectedWallet,
    walletAccounts,
    selectedSubnetId,
    disconnectKeplr,
    initializeKeplr,
    intializeMetamask,
  } = useContext(WalletContext);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    console.log("logout");
    clearSessionStorage();
    dispatch(removeAuthData());
    disconnectKeplr?.();
    disconnect();
  };
console.log({connectedWallet, accounts: walletAccounts})
  let userProfileItem: MenuProps["items"] = [
    {
      key: "2",
      icon: <HeroIcons.UserCircleIcon className="ml-2 h-[20px]" />,
      label: (
        <Link href={"/subnet"} className="font-medium text-base ml-2">
          Subnets
        </Link>
      ),
    },
  ];

  if (!process.env.NEXT_PUBLIC_HIDE_AIRDROP) {
    userProfileItem.push({
      key: "2.5",
      icon: <HeroIcons.UserCircleIcon className="ml-2 h-[20px]" />,
      label: (
        <Link href={"/airdrop"} className="font-medium text-base ml-2">
          Airdrop
        </Link>
      ),
    });
  }
  userProfileItem = userProfileItem.concat([
    // {
    //   icon: <HeroIcons.Cog8ToothIcon className="ml-2 h-[20px]" />,
    //   label: <span className="font-medium text-base ml-2">Switch Wallet</span>,
    //   key: "3",
    //   onClick: () => {
    //     setShowAuthenticationModal((old) => !old);
    //   },
    // },
    {
      label: (
        <span className="font-medium text-base ml-2 text-[#FDA29B]">
          Log Out
        </span>
      ),
      key: "4",
      onClick: handleLogout,
    },
  ]);
  return (
    <>
      <header className="sticky top-0 flex flex-col  backdrop-blur-xl z-50 items-end ">
        <div className="flex w-full flex-wrap ">
          {/* <Image
          src="/logo.svg"
          alt="Vercel Logo"
          className="light:invert"
          width={100}
          height={24}
          priority
        /> */}
          <div className="w-full md:w-auto flex gap-3 md:gap-4 items-center !text-xs !text-white bg-mainLightColor slant h-[50px] px-5 md:px-10">
            <span>MLT PRICE: $0.0001</span>
            <span>MSG PRICE: 0.002MLT (~$0.00002)</span>
          </div>

          <div className=" hidden md:flex ml-auto items-center">
            <Tag color="red" className="!mr-20">
              <div className="flex items-center gap-2">
                <span className="ml-0 text-nowrap uppercase">{NETWORK}</span>
                {/* <HeroIcons.ChevronDownIcon className="h-[20px] text-white" /> */}
              </div>
            </Tag>
          </div>
        </div>
        <div className="flex w-full flex-wrap px-2 md:px-8 bg-secondaryBg h-20 items-center">
          <a href="/">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="mLayer"
                className="bg-cover mt-0"
                width={40}
                height={40}
                priority
              />{" "}
              <span className="text-2xl font-bold font-assistant bg:text-white">
                {headerText}
              </span>
            </div>
          </a>

          <div className="ml-auto flex lg:hidden">
            <AnimatePresence>
              {!showMobileMenu && (
                <Dropdown
                  menu={{ items: userProfileItem }}
                  placement="bottomLeft"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    className="h-[40px] rounded-full bg-[#6A6A6A] flex justify-center items-center px-1 "
                  >
                    <Avatar
                      size={32}
                      className="!bg-[#CBD5E1]"
                      src={
                        connectedWallet ? `/icons/${connectedWallet}.svg` : ""
                      }
                      icon={initialLoading ? <Spin /> : <UserOutlined />}
                    />
                  </motion.div>
                </Dropdown>
              )}
            </AnimatePresence>

            <span onClick={() => setShowMobileMenu((old) => !old)}>
              {showMobileMenu ? (
                <HeroIcons.XMarkIcon className="ml-2 h-[40px] " />
              ) : (
                <HeroIcons.Bars3Icon className="ml-2 h-[40px] " />
              )}
            </span>
          </div>

          <div className=" hidden lg:flex grow items-center gap-2">
            <Input
              className="!w-[342px] ml-auto"
              prefix={<MdSearch size={20} className="text-red-50" />}
              placeholder="Search by Account, Agent, Event Hash"
            />

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
                className="h-[50px] flex justify-center items-center pl-1 pr-3 "
              >
                <Typography.Text className="ml-0 !text-white text-nowrap">
                  Connect Wallet
                </Typography.Text>
              </MotionButton>
            )}

            {connectedWallet && walletAccounts[connectedWallet]?.[0] && (
              <Dropdown
                menu={{ items: userProfileItem }}
                placement="bottomLeft"
              >
                <motion.a
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  className="h-[40px] rounded-full bg-gray-100 dark:bg-[#6A6A6A] flex gap-2 justify-center items-center px-2"
                >
                  <>
                    <Avatar
                      size={28}
                      // className="dark:!bg-[#CBD5E1] !border-0"
                      src={`/icons/${connectedWallet}.svg`}
                      icon={<UserOutlined />}
                    />
                    <span className="text-sm">
                      {shorternAddress(
                        walletAccounts[connectedWallet]?.[0] ?? ""
                      )}
                    </span>
                  </>
                </motion.a>
              </Dropdown>
            )}

            {/* <Switch
              value={themeType == "light"}
              onChange={() => {
                toggleTheme?.();
              }}
            /> */}
            {/* <Button className="!h-12 !w-12" type="primary" ghost>
              <MdNightlight size={20} />
            </Button> */}
            <div
              onClick={() => {
                toggleTheme?.();
              }}
              className="h-12 w-12 bg-secondary rounded-full border border-borderColor flex items-center justify-center cursor-pointer"
            >
              <AnimatePresence>
                {themeType == "dark" && (
                  <motion.span
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                  >
                    <MdSunny
                      color="#2F5ED2"
                      className="!opacity-100"
                      size={20}
                    />
                  </motion.span>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {themeType == "light" && (
                  <motion.span
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                  >
                    <MdNightlight
                      color="#2F5ED2"
                      className="!opacity-100"
                      size={20}
                    />
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>
      {/* <Button ghost className=" my-6  self-center w-2/3" type="primary">
        <span>Ad Space</span>
      </Button> */}
    </>
  );
};
