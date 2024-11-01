"use client";
import { AirDropContext } from "@/context";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import React, { useContext } from "react";
import { useRouter } from "next/navigation";

interface AirdropMobileAsideProps {}
export const AirdropMobileAside = (props: AirdropMobileAsideProps) => {
  const { tabsDetails, setShowMobileMenu } = useContext(AirDropContext);
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedScreen = searchParams.get("tab")??0;
  return (
    <div className="bg-black bg-opacity-30  absolute z-50">
      <motion.div
        initial={{ x: 300 }}
        animate={{ x: 0 }}
        exit={{ x: 300 }}
        className="w-svw h-svh grid grid-cols-3"
      >
        <div
          className="h-full col-span-1 "
          onClick={() => setShowMobileMenu?.((old) => !old)}
        ></div>
        <div className="bg-secondaryBg px-7 py-20 flex flex-col h-full col-span-2 gap-6">
          {tabsDetails?.map((detail, index) => {
            return (
              <div
                onClick={() => {
                  router.push(`/airdrop?tab=${index}`);
                }}
                key={index}
                className={` ${
                  index.toString() == selectedScreen
                    ? "bg-mainLightColor"
                    : "bg-[var(--m-background-color)]"
                } py-4 min-h-24 px-3 rounded-lg flex flex-col gap-4`}
              >
                <span className="dark:text-white font-bold text-sm">
                  {detail.categoryName}
                </span>
                <span className="dark:text-white text-xs">
                  <span className="dark:text-white text-xs">{`Points Earned - ${detail.pointsEarned} out of ${detail.totalPoints}`}</span>
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
