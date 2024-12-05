"use client";
import { WalletContext } from "@/context";
import { Card, Divider, Table, Spin } from "antd";
import Link from "next/link";
import React, { useContext, useEffect, useMemo } from "react";
import * as HeroIcons from "@heroicons/react/24/solid";
import {
  HomeStatCardOne,
  HomeStatCardTwo,
  NewHomeStatCardOne,
} from "@/components";
import { currencyFormat } from "@/utils";
import { ColumnsType } from "antd/es/table";
import { BlockStat } from "@/model/block-stats";
import { ethers } from "ethers";

const columns: ColumnsType<BlockStat> = [
  // {
  //   title: "Block",
  //   dataIndex: "blk",
  //   key: "blk",
    
  // },
  {
    title: "Cycle",
    dataIndex: "cy",
    key: "cy",
  },
  {
    title: "Events",
    dataIndex: "eC",
    key: "eC",
  },
  {
    title: "Last Event",
    dataIndex: "e",
    key: "e",
  },
  // {
  //   title: "Finalized",
  //   dataIndex: "address",
  //   key: "finalized",
  // },
];

const DashboardPage = () => {
  var intervalId: any;
  const { loaders, blockStatsList, mainStatsData, setToggleGroupStats } =
    useContext(WalletContext);

  const dataSource = useMemo(() => {
    return blockStatsList?.data ?? [];
  }, [blockStatsList]);
console.log('BLOCKSTATA', blockStatsList)
  useEffect(() => {
    intervalId = setInterval(() => {
      setToggleGroupStats?.((old) => !old);
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);
  return (
    <div className="flex flex-col gap-4 my-16 md:my-20 mx-5 md:mx-10 ">
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 md:col-span-6 lg:col-span-3">
          <NewHomeStatCardOne
            title="Total Accounts"
            amount={`${mainStatsData?.data.accounts ?? ""}`}
            title2="Agents"
            amount2={`${mainStatsData?.data.agentC ?? ""}`}
            icon={<HeroIcons.DevicePhoneMobileIcon className="h-[18px] !text-[#AEB9E1] " />}
          />
        </Card>
        
        <Card className="col-span-12 md:col-span-6 lg:col-span-3">
          <NewHomeStatCardOne
            title="Total Events"
            amount={`${mainStatsData?.data.event_count ?? ""}`}
            icon={
              <HeroIcons.EnvelopeIcon className="h-[18px] !text-[#AEB9E1] " />
            }
          />
        </Card>
        <Card className="col-span-12 md:col-span-6 lg:col-span-3">
          <HomeStatCardTwo
            title="TVL"
            amount={`${ethers.formatEther(String(mainStatsData?.data.tvl ?? "0"))} MLT`}
            offset={`${currencyFormat(0)}`}
            icon={
              <HeroIcons.BarsArrowUpIcon className="h-[18px] !text-[#AEB9E1] " />
            }
          />
        </Card>

        <Card className="col-span-12 md:col-span-6 lg:col-span-3">
          <HomeStatCardTwo
            title="Total Tranx Volume"
            amount={`${ethers.formatEther(
             String(mainStatsData?.data.total_events_value ?? 0)
            )} MLT`}
            // date="2h"
            offset="~$1,212"
            icon={
              <HeroIcons.WalletIcon className="h-[18px] !text-[#AEB9E1] " />
            }
          />
        </Card>
      </div>

      <div className="flex justify-center mt-10">
        <span className="font-bold text-sm dark:text-white">Recent Cycles</span>
      </div>
      <Table
        // bordered
        className="rounded-lg"
        dataSource={(dataSource ?? []).filter((d) => d.blk != 0 || d.cy != 0)}
        columns={columns}
        loading={loaders["getBlockStats"] && dataSource.length == 0}
      />
    </div>
  );
};

export default DashboardPage;
