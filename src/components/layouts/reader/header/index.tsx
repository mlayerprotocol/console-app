"use client";
import {
  Avatar,
  Button,
  Dropdown,
  Input,
  MenuProps,
  Spin,
  Typography,
} from "antd";
import Image from "next/image";
import React, { useContext, useState } from "react";
import { UserOutlined } from "@ant-design/icons";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/redux/app";
import { AppContext } from "@/context";
import { clearSessionStorage } from "@/utils";
import { removeAuthData } from "@/redux/slices";
import * as HeroIcons from "@heroicons/react/24/solid";
// import { setToken } from "@/redux/slices";

interface AppHeaderProps {}
export const AppHeader = (props: AppHeaderProps) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showMobilMoney, setShowMobilMoney] = useState<boolean>(false);
  const { initialLoading } = useContext(AppContext);
  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.auth.data);

  const handleLogout = () => {
    console.log("logout");
    clearSessionStorage();
    dispatch(removeAuthData());
  };

  return (
    <header className="sticky top-0 flex flex-col py-4 px-4 md:px-20 lg:py-10  backdrop-blur-xl z-50 items-end bg-[#141414]">
      <div className="flex w-full flex-wrap items-center justify-between">
        <div className="flex gap-3 md:gap-4 items-center">
          <Button
            className="!rounded-lg !border-[#424242] w-10 [&.ant-btn]:!h-10 !p-0 !flex items-center justify-center"
            ghost
          >
            <HeroIcons.ChevronLeftIcon className="h-[20px] text-white" />
          </Button>
          <Image
            src="/logo/icon.svg"
            alt="Vercel Logo"
            width={35}
            height={46}
            priority
            className=" !w-[25px] !h-[32px] md:!w-[35px] md:!h-[46px]"
          />
          <Image
            src="/logo/text.svg"
            alt="Vercel Logo"
            width={154}
            height={31}
            priority
            className=" !w-[108px] !h-[21px] md:!w-[154px] md:!h-[31px]"
          />
        </div>

        <span className="text-2xl hidden lg:block">Tales Of Narnia</span>

        <div className="lg:flex gap-2 hidden ">
          <Button shape="round">
            <div className="flex gap-2">
              <Image
                src="/icons/crown.svg"
                alt="Vercel Logo"
                width={20}
                height={20}
                priority
                className=" "
              />
              <span>Get a Physical Copy</span>
            </div>
          </Button>
          <Button shape="round" type="primary">
            <div className="flex gap-2">
              <HeroIcons.ArrowDownTrayIcon className="h-[20px] text-black" />
              <span className="">Download Comic</span>
            </div>
          </Button>
        </div>
        <Button
          onClick={() => setShowMobilMoney((old) => !old)}
          className="!rounded-lg !border-[#424242] w-10 [&.ant-btn]:!h-10 !p-0 !flex items-center justify-center lg:!hidden"
          ghost
        >
          <HeroIcons.EllipsisVerticalIcon className="h-[20px] text-white" />
        </Button>
        <AnimatePresence>
          {showMobilMoney && (
            <motion.div
              initial={{ opacity: 0, y: -80, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -80, height: 0 }}
              transition={{
                duration: 1,
                height: { duration: 0.5 },
              }}
              className="lg:hidden gap-2 flex flex-col w-full  mt-6"
            >
              <Button shape="round">
                <div className="flex gap-2">
                  <Image
                    src="/icons/crown.svg"
                    alt="Vercel Logo"
                    width={20}
                    height={20}
                    priority
                    className=" "
                  />
                  <span>Get a Physical Copy</span>
                </div>
              </Button>
              <Button shape="round" type="primary">
                <div className="flex gap-2">
                  <HeroIcons.ArrowDownTrayIcon className="h-[20px] text-black" />
                  <span className="">Download Comic</span>
                </div>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
