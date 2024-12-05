import { AuthModelData } from "@/model";
import * as HeroIcons from "@heroicons/react/24/solid";
import { Spin, Tag } from "antd";
import { ReactNode } from "react";

interface HomeStatCardOneProps {
  title: string;
  amount: string;
  date?: string;
  offset?: string;
  icon?: ReactNode;
}
export const HomeStatCardOne = (props: HomeStatCardOneProps) => {
  const { title, amount, date, offset, icon } = props;
  return (
    <div className="flex gap-3">
      {icon ?? <HeroIcons.UsersIcon className="ml-2 h-[30px] " />}
      <div className="flex flex-col grow">
        <span className="text-gray-500 text-xs">{title}</span>
        <span className="font-normal">
          {amount === "" ? <Spin size="small" /> : amount}
        </span>
      </div>
      {(!!date || !!offset) && (
        <div className="flex flex-col items-end">
          <span className="text-gray-500 text-sm">{date}</span>
          <span className="text-sm text-green-500">{offset}</span>
        </div>
      )}
    </div>
  );
};

interface NewHomeStatCardOne {
  title: string;
  amount: string;
  icon?: ReactNode;
  amount2?: string;
  title2?: string;
}
export const NewHomeStatCardOne = (props: NewHomeStatCardOne) => {
  const { title, amount, amount2, title2, icon } = props;
  return (
    <>
      <div className="flex flex-row gap-3 justify-between">
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          {icon ?? <HeroIcons.UserIcon className="ml-2 h-[18px] " />}
          {<span className="text-[#AEB9E1] text-xs">{title}</span>}
        </div>
        <span className="font-bold text-2xl dark:text-white">
          {amount === "" ? <Spin size="small" /> : amount}
        </span>
      </div>
      {!!title2 && <div className="flex flex-col gap-3">
          <div className="flex gap-2 justify-end">
          {<span className="text-[#AEB9E1] text-xs">{title2}</span>}
          {icon ?? <HeroIcons.DevicePhoneMobileIcon className="ml-2 h-[18px] " />}
         
        </div>
        <span className="font-bold text-2xl dark:text-white flex justify-end">
          {amount2 === "" ? <Spin size="small" /> : amount2}
        </span>
        </div>}
        </div>
    </>
  );
};

interface HomeStatCardTwoProps {
  title: string;
  amount: string;
  date?: string;
  offset?: string;
  icon?: ReactNode;
}
export const HomeStatCardTwo = (props: HomeStatCardTwoProps) => {
  const { title, amount, date, offset, icon } = props;
  return (
    <div className="flex flex-col gap-3 overflow-x-auto styled-scrollbar !pb-0">
      <div className="flex gap-2 flex-wrap">
        {icon ?? <HeroIcons.UsersIcon className="ml-2 h-[30px] " />}
        {<span className="text-[#AEB9E1] text-xs">{title}</span>}

        <Tag color="green" className="!ml-auto text-sm">
          {offset}
        </Tag>
      </div>
      <span className="font-bold text-xl dark:text-white">
        {amount === "" ? <Spin size="small" /> : amount}
      </span>
    </div>
  );
};
