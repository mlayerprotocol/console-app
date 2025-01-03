"use client";
import {
  FOLLOW_DISCORD_HTTP,
  FOLLOW_TWITTER_HTTP,
  INFO_LINKS,
  MIDDLEWARE_HTTP_URLS,
  displayVariants,
  makeRequest,
} from "@/utils";
import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion } from "framer-motion";
import { CreateMessage, CreateTopic } from "@/components";
import { WalletContext } from "@/context";
import { Button, Divider, Spin, Table, notification } from "antd";
import { PointData } from "@/model/points";
import { PointDetailModel } from "@/model/points/detail";
import * as HeroIcons from "@heroicons/react/24/solid";
import { useSearchParams } from "next/navigation";
import { Address } from "@mlayerprotocol/core/src/entities";
import { GoToSolidBase } from "@/components/modals/solidbase/solidbase";
interface AirDropProps {
  onSuccess?: (values: any) => void;
  handleCreateAccount?: () => void;
}
export const AirDrop = (props: AirDropProps) => {
  const searchParams = useSearchParams();
  const [showSolidBaseModal, setShowSolidBaseModal] = useState(false)
  const [onContinue, setOnContinue] = useState<any>(null)


  const informSolidBaseModal = (action: () => Promise<void>) => {
    setOnContinue(()=>action)
    setShowSolidBaseModal(true)
  }

  const [onFocusCb, setOnFocusCb] = useState<() => void | undefined>();
  const [toggleFocus, setToggleFocus] = useState(false);
  const [loaders, setLoaders] = useState<Record<string, boolean>>({});
  const {
    pointsList,
    pointsDetail,
    walletAccounts,
    connectedWallet,
    setPointToggleGroup,
  } = useContext(WalletContext);
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
        point: `${_pt?.points ?? "..."} points`,
        amount: _pt?.claimStatus?.[0]?.points ?? "...",
        _pt,
      };
    });
  }, [pointsList]);

  useEffect(() => {
    const referrer = searchParams.get("uid");
   
    if (referrer && connectedWallet) {
      //
      makeRequest(MIDDLEWARE_HTTP_URLS.connect.url, {
        method: MIDDLEWARE_HTTP_URLS.claim.method,
        body: JSON.stringify({
          account: Address.fromString(
            String(walletAccounts[connectedWallet]?.[0])
          ).toAddressString(),
          referredBy: referrer,
        }),
      }).then((b) => {
        setPointToggleGroup?.((old) => !old);
      });
    }
  }, [searchParams, connectedWallet]);
  console.log({ pointsList });

  useEffect(() => {
    console.log({ document });
    if (!document) return;
    document.body.onfocus = () => {
      console.log("document.body.onfocus", { event });
      setToggleFocus((old) => !old);
    };
  }, []);

  useEffect(() => {
    // console.log("++++ .toggleFocus", toggleFocus, onFocusCb);
    if (!onFocusCb) return;

    onFocusCb();
    setOnFocusCb(undefined);
  }, [toggleFocus]);

  const handleAction = async (
    obj: {
      title: string;
      point: string;
      amount: string | number;
      actionText?: undefined;
      username?: undefined;
      _pt: PointData | undefined;
    },
    pointsDetail: PointDetailModel | undefined,
    { alwaysConnect }: { alwaysConnect?: boolean } = {
      alwaysConnect: false,
    }
  ) => {
    switch (obj._pt?.type) {
      // case "Follow @mlayer on X":
      case "x-follow":
        if (pointsDetail?.data?.account?.socials?.twitter && !alwaysConnect) {
          if (window != null) {
            const cb = () => {
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
            };
            setOnFocusCb(() => cb);
            // setTimeout(cb, 10000);
            window.open(`${FOLLOW_TWITTER_HTTP}/${obj.username}`, "_blank");
          }
        } else {
          if (window != null) {
            informSolidBaseModal(async () => {
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
            })
          }
        }
        
        break;
      case "discord-follow":
        if (pointsDetail?.data?.account?.socials?.discord) {
          // setLoaders((old) => ({ ...old, [obj.title]: true }));
          if (window != null) {
            window.open(FOLLOW_DISCORD_HTTP, "_blank");
            const cb = () => {
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
            };
            setOnFocusCb(() => cb);
            // setTimeout(cb, 10000);
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

      case "referral":
        if (pointsDetail?.data?.account?.socials?.twitter) {
          // setLoaders((old) => ({ ...old, [obj.title]: true }));
          if (window != null) {
            navigator.clipboard.writeText(
              `${window.location.href}?referrer=${pointsDetail?.data?.account?.socials?.twitter}`
            );
            notification.success({ message: "Referral Link has been copied" });
          }
        } else {
          notification.info({
            message: "X account needs to be connected first",
          });
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
    switch (obj._pt?.type) {
      case "x-follow":
        // case "Follow @rulerOfCode on X":
        if (pointsDetail?.data?.account?.socials?.twitter) {
          return "Click to follow @" + obj._pt?.data?.toLocaleLowerCase();
        }
        break;
      case "discord-follow":
        if (pointsDetail?.data?.account?.socials?.discord) {
          return "Click to join @" + obj._pt?.data?.toLocaleLowerCase();
        }
        break;
    }

    return obj.actionText ?? "";
  };

  const renderUserName = (
    obj: {
      title: string;
      point: string;
      amount: string | number;
      actionText?: undefined;
      _pt: PointData | undefined;
    },
    pointsDetail: PointDetailModel | undefined
  ): string => {
    switch (obj._pt?.type) {
      case "x-follow":
        // case "Follow @rulerOfCode on X":
        if (pointsDetail?.data?.account?.socials?.twitter) {
          return " | @" + pointsDetail?.data?.account?.socials?.twitter;
        }
        break;
      case "discord-follow":
        if (pointsDetail?.data?.account?.socials?.discord) {
          return " | @" + pointsDetail?.data?.account?.socials?.discord;
        }
        break;
    }

    return "";
  };
  return (
    <motion.div
      className="inline-flex w-full  py-8 content-center justify-center"
      variants={displayVariants}
      initial={"hidden"}
      animate={"show"}
      exit={{
        opacity: 0,
        scale: 0,
      }}
      // transition={{ duration: 1, delay: 1 }}
    >
      <div className="w-full max-w-[800px]">
        <div className="flex my-2">
          <span className="text-gray-400">
            Complete the following activities to earn points towards our
            airdrop.{" "}
            <a
              className="text-blue-500"
              href={INFO_LINKS.airdrop}
              target="_blank"
            >
              Learn more...
            </a>
          </span>
        </div>
        <div className="flex my-3 text-lg justify-between bg-gray-900 p-5 radius-10">
          <span>Total Points Earned</span>
          <span>{pointsDetail?.data?.account.totalPoints ?? "---"}</span>
        </div>
        <div className="flex my-1 text-sm justify-end mb-10">
          <span className="text-blue-500">View Leader Board</span>
          {/* <span>{pointsDetail?.data.account.totalPoints ?? "---"}</span> */}
        </div>
        {/*  */}
        <div className="flex flex-col">
          <Fragment key="00">
            <div className="flex items-center gap-2">
              <div className="flex flex-col w-1/2">
                <span className="text-xl text-gray-300 flex gap-2 items-center">
                  <span>Activity</span>
                </span>
              </div>
              <span className="text-gray-300 text-xl">Points Accruable</span>
              <span className="text-gray-300 text-xl ml-auto">
                Points Earned
              </span>
            </div>
            <Divider className="!border-t-4 !border-gray-300 !mt-2" />
          </Fragment>
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
                    <span>
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
                      )}{" "}
                      <span
                        onClick={() => {
                          handleAction(e as any, pointsDetail, {
                            alwaysConnect: true,
                          });
                        }}
                        className="text-sm text-green-500 cursor-pointer"
                      >
                        {loaders[e.title] ? (
                          <Spin />
                        ) : (
                          renderUserName(e as any, pointsDetail)
                        )}
                      </span>
                    </span>
                  </div>
                  <span className="text-gray-500">{`${e.point}${
                    e._pt?.unit ? ` per ${e._pt?.unit}` : ""
                  }`}</span>
                  <span className="text-gray-200 text-2xl ml-auto">
                    {e.amount}
                  </span>
                </div>
                <Divider className="!border-t-4 !border-gray-500 !mt-2" />
              </Fragment>
            );
          })}
        </div>
        <GoToSolidBase isModalOpen={showSolidBaseModal} onContinue={onContinue} onCancel={()=>setShowSolidBaseModal(false)} />
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
