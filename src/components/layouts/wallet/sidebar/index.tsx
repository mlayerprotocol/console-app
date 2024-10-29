"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useContext } from "react";
import * as HeroIcons from "@heroicons/react/24/solid";
import {
  MdBroadcastOnPersonal,
  MdHomeFilled,
  MdOutlineCardGiftcard,
} from "react-icons/md";
import { WalletContext } from "@/context";

interface SubnetAsideProps {}
export const SubnetAside = (props: SubnetAsideProps) => {
  const { selectedSubnetId, setSelectedSubnetId } = useContext(WalletContext);
  const pathname = usePathname();
  console.log({ pathname });
  return (
    <div className="bg-secondaryBg px-6 py-10 flex flex-col h-full">
      <Link
        className={`${
          pathname.indexOf(`/subnet/${selectedSubnetId}/agents`) == 0
            ? "border-l-2 border-l-mainLightColor bg-[var(--m-background-color)] dark:!text-white"
            : ""
        }  p-4 rounded font-bold  hover:text-gray-300 bg-red flex items-center gap-2 text-sm`}
        href={`/subnet/${selectedSubnetId}/agents`}
      >
        <HeroIcons.CpuChipIcon className="h-[20px]" />
        <span>Agents</span>
      </Link>

      <Link
        className={`${
          pathname.indexOf(`/subnet/${selectedSubnetId}/topics`) == 0
            ? "border-l-2 border-l-mainLightColor bg-[var(--m-background-color)] dark:!text-white"
            : ""
        }  p-4 rounded font-bold  hover:text-gray-300 bg-red flex items-center gap-2 text-sm`}
        href={`/subnet/${selectedSubnetId}/topics`}
      >
        <HeroIcons.NewspaperIcon className="h-[20px]" />
        <span>Topics</span>
      </Link>

 
        <Link
          className={`${
            pathname.indexOf(`/subnet/${selectedSubnetId}/settings`) == 0
              ? "border-l-2 border-l-mainLightColor bg-[var(--m-background-color)] dark:!text-white"
              : ""
          }  p-4 rounded font-bold  hover:text-gray-300 bg-red flex items-center gap-2 text-sm`}
          href={`/subnet/${selectedSubnetId}/settings`}
        >
          <HeroIcons.Cog8ToothIcon className="h-[20px]" />
          <span>Settings</span>
        </Link>
     
    </div>
  );
};
