"use client";
import { AirDropContext } from "@/context";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useContext } from "react";

interface AirdropAsideProps {}
export const AirdropAside = (props: AirdropAsideProps) => {
  const { tabsDetails } = useContext(AirDropContext);
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedScreen = searchParams.get("tab")??0;

  return (
    <div className="bg-secondaryBg px-7 py-20 flex flex-col h-full gap-6">
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
            } py-4 min-h-24 px-3 rounded-lg flex flex-col gap-4 cursor-pointer`}
          >
            <span className="dark:text-white font-bold text-sm">
              {detail.categoryName}
            </span>
            <span className="dark:text-white text-xs">{`Points Earned - ${detail.pointsEarned} out of ${detail.totalPoints}`}</span>
          </div>
        );
      })}
    </div>
  );
};
