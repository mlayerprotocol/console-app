"use client";
import {
  FOLLOW_DISCORD_HTTP,
  FOLLOW_TWITTER_HTTP,
  MIDDLEWARE_HTTP_URLS,
  displayVariants,
  makeRequest,
} from "@/utils";
import React, { Fragment, useContext, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CreateMessage, CreateTopic } from "@/components";
import { WalletContext } from "@/context";
import { Button, Divider, Spin, Table } from "antd";
import { PointData } from "@/model/points";
import { PointDetailModel } from "@/model/points/detail";
import * as HeroIcons from "@heroicons/react/24/solid";
interface AirDropProps {
  onSuccess?: (values: any) => void;
  handleCreateAccount?: () => void;
}
export const AirDrop = (props: AirDropProps) => {
  const [showCreateMessageModal, setShowCreateMessageModal] =
    useState<boolean>(false);
  const [loaders, setLoaders] = useState<Record<string, boolean>>({});
  const { pointsList, pointsDetail, setPointToggleGroup } =
    useContext(WalletContext);
  const activites = useMemo(() => {
    // return (pointsList?.data ?? []).map((point) => ({
    //   title: point.activityName,
    //   point: "?? points/downline",
    //   amount: point.points,
    //   actionText: "Get referral link",
    // }));
    const _points = pointsList?.data ?? [];
    return ACTIVITIES.map((activity) => {
      const _pt = _points.find((e) => e.activityName == activity.title);
      return {
        ...activity,
        title: activity.title,
        point: `${_pt?.points ?? "..."} point`,
        amount: _pt?.claimStatus?.[0]?.points ?? "...",
        _pt,
      };
    });
  }, [pointsList]);
  console.log({ pointsList });

  const handleAction = async (
    obj: {
      title: string;
      point: string;
      amount: string | number;
      actionText?: undefined;
      username?: undefined;
      _pt: PointData | undefined;
    },
    pointsDetail: PointDetailModel | undefined
  ) => {
    switch (obj._pt?.activityName) {
      case "Follow @mlayer on X":
      case "Follow @rulerOfCode on X":
        if (pointsDetail?.data?.account?.socials?.twitter) {
          if (window != null) {
            window
              .open(`${FOLLOW_TWITTER_HTTP}/${obj.username}`, "_blank")
              ?.focus();
            setTimeout(() => {
              makeRequest(MIDDLEWARE_HTTP_URLS.twitter.verify.url, {
                method: MIDDLEWARE_HTTP_URLS.twitter.verify.method,
                body: JSON.stringify({
                  projectId: obj._pt?.projectId,
                  activityId: obj._pt?.id,
                  username: obj.username,
                }),
                headers: {
                  "x-signed-data": pointsDetail.data.token,
                },
              }).then((b) => {
                setPointToggleGroup?.((old) => !old);
              });
            }, 10000);
          }
        } else {
          if (window != null) {
            setLoaders((old) => ({ ...old, [obj.title]: true }));
            await makeRequest(MIDDLEWARE_HTTP_URLS.twitter.connect.url, {
              method: MIDDLEWARE_HTTP_URLS.twitter.connect.method,
              body: JSON.stringify({
                projectId: obj._pt?.projectId,
                path: window.location.href,
              }),
              headers: {
                "x-signed-data": pointsDetail?.data?.token ?? "",
              },
            })
              .then((r) => r?.json())
              .then((b) => {
                const redirect_url = b["data"]["redirect_url"];
                window.open(redirect_url)?.focus();
                console.log({ b, redirect_url });
              });
            setLoaders((old) => ({ ...old, [obj.title]: false }));
          }
        }
        break;
      case "Follow @mlayer on Discord":
        if (pointsDetail?.data?.account?.socials?.discord) {
          // setLoaders((old) => ({ ...old, [obj.title]: true }));
          if (window != null) {
            window.open(FOLLOW_DISCORD_HTTP, "_blank")?.focus();
            setTimeout(() => {
              makeRequest(MIDDLEWARE_HTTP_URLS.discord.verify.url, {
                method: MIDDLEWARE_HTTP_URLS.discord.verify.method,
                body: JSON.stringify({
                  projectId: obj._pt?.projectId,
                  activityId: obj._pt?.id,
                  username: obj.username,
                }),
                headers: {
                  "x-signed-data": pointsDetail.data.token,
                },
              }).then((b) => {
                setPointToggleGroup?.((old) => !old);
              });
            }, 10000);
          }
        } else {
          if (window != null) {
            setLoaders((old) => ({ ...old, [obj.title]: true }));
            await makeRequest(MIDDLEWARE_HTTP_URLS.discord.connect.url, {
              method: MIDDLEWARE_HTTP_URLS.discord.connect.method,
              body: JSON.stringify({
                projectId: obj._pt?.projectId,
                path: window.location.href,
              }),
              headers: {
                "x-signed-data": pointsDetail?.data?.token ?? "",
              },
            })
              .then((r) => r?.json())
              .then((b) => {
                const redirect_url = b["data"]["redirect_url"];
                window.open(redirect_url)?.focus();
                console.log({ b, redirect_url });
              });
            setLoaders((old) => ({ ...old, [obj.title]: false }));
          }
        }
        break;
    }
  };
  const renderSubtext = (
    obj: {
      title: string;
      point: string;
      amount: string | number;
      actionText?: undefined;
      _pt: PointData | undefined;
    },
    pointsDetail: PointDetailModel | undefined
  ): string => {
    switch (obj._pt?.activityName) {
      case "Follow @mlayer on X":
      case "Follow @rulerOfCode on X":
        if (pointsDetail?.data?.account?.socials?.twitter) {
          return obj._pt?.activityName;
        }
        break;
      case "Follow @mlayer on Discord":
        if (pointsDetail?.data?.account?.socials?.discord) {
          return obj._pt?.activityName;
        }
        break;
    }

    return obj.actionText ?? "";
  };
  return (
    <motion.div
      className="inline-flex w-full flex-col gap-6 py-8"
      variants={displayVariants}
      initial={"hidden"}
      animate={"show"}
      exit={{
        opacity: 0,
        scale: 0,
      }}
      // transition={{ duration: 1, delay: 1 }}
    >
      <div className="flex my-2">
        <span>
          Complete the following activities to earn points towards our airdrop
        </span>
      </div>
      <div className="flex my-2 text-lg justify-between">
        <span>Total Points Earned</span>
        <span>{pointsDetail?.data?.account.totalPoints ?? "---"}</span>
      </div>
      <div className="flex my-1 text-sm justify-end">
        <span className="text-blue-500">View Leader Board</span>
        {/* <span>{pointsDetail?.data.account.totalPoints ?? "---"}</span> */}
      </div>
      {/*  */}
      <div className="flex flex-col">
        {activites.map((e, i) => {
          let showCheck = false;
          if (i < 4 && parseInt(e.amount.toString()) > 0) {
            showCheck = true;
          }

          return (
            <Fragment key={i}>
              <div className="flex items-center gap-2">
                <div className="flex flex-col w-1/2">
                  <span className="text-lg text-gray-500 flex gap-2 items-center">
                    <span>{e.title}</span>
                    {showCheck && (
                      <HeroIcons.CheckCircleIcon className="h-[20px] text-green-500" />
                    )}
                  </span>
                  {e.actionText && (
                    <span
                      onClick={() => {
                        handleAction(e as any, pointsDetail);
                      }}
                      className="text-sm text-blue-500 cursor-pointer"
                    >
                      {loaders[e.title] ? (
                        <Spin />
                      ) : (
                        renderSubtext(e as any, pointsDetail)
                      )}
                    </span>
                  )}
                </div>
                <span className="text-gray-400">{e.point}</span>
                <span className="text-gray-500 text-2xl ml-auto">
                  {e.amount}
                </span>
              </div>
              <Divider className="!border-t-4 !border-gray-300 !mt-2" />
            </Fragment>
          );
        })}
      </div>
    </motion.div>
  );
};

const ACTIVITIES = [
  {
    title: "Connect Wallet",
    point: "3 points",
    amount: "3",
  },

  {
    title: "Follow @mlayer on X",
    point: "6 points",
    amount: "0",
    actionText: "Connect your X Account",
    username: "mlayerprotocol",
  },
  {
    title: "Follow @mlayer on Discord",
    point: "6 points",
    amount: "0",
    actionText: "Connect your Discord Account",
    username: "shogun",
  },
  {
    title: "Follow @rulerOfCode on X",
    point: "6 points",
    amount: "0",
    actionText: "Connect your X Account",
    username: "rulerOfCode",
  },
  {
    title: "Referrals",
    point: "50 points/downline",
    amount: "30",
    actionText: "Get referral link",
  },
  {
    title: "Authorize Agent",
    point: "3 points",
    amount: "6",
  },
  {
    title: "Create Topic",
    point: "3 points",
    amount: "6",
  },
  {
    title: "Join Topic",
    point: "4 points",
    amount: "9",
  },
  {
    title: "Send Message To Topic",
    point: "3 points",
    amount: "23",
  },
];
