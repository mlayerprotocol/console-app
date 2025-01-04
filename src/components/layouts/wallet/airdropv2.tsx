"use client";
import {
  FOLLOW_DISCORD_HTTP,
  FOLLOW_TWITTER_HTTP,
  INFO_LINKS,
  MIDDLEWARE_HTTP_URLS,
  displayVariants,
  makeRequest,
  shorternAddress,
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
import { AirDropContext, WalletContext } from "@/context";
import { Button, Divider, Spin, Table, notification } from "antd";
import { PointData } from "@/model/points";
import { PointDetailModel } from "@/model/points/detail";
import * as HeroIcons from "@heroicons/react/24/solid";
import { useSearchParams } from "next/navigation";
import { Address } from "@mlayerprotocol/core/src/entities";
import { GoToSolidBase } from "@/components/modals/solidbase/solidbase";
import { ColumnsType } from "antd/es/table";
import { BsBadge3D } from "react-icons/bs";
import Image from "next/image";
import { MdMenu } from "react-icons/md";
import { LeaderboardData } from "@/model/leaderboard";
import { Activity } from "@/model/points/by-category";
interface AirDropv2Props {
  onSuccess?: (values: any) => void;
  handleCreateAccount?: () => void;
}
export const AirDropv2 = (props: AirDropv2Props) => {
  const searchParams = useSearchParams();
  const [showSolidBaseModal, setShowSolidBaseModal] = useState(false);
  const [onContinue, setOnContinue] = useState<any>(null);

  const informSolidBaseModal = (action: () => Promise<void>) => {
    setOnContinue(() => action);
    setShowSolidBaseModal(true);
  };

  const [onFocusCb, setOnFocusCb] = useState<() => void | undefined>();
  const [toggleFocus, setToggleFocus] = useState(false);
  const [loaders, setLoaders] = useState<Record<string, boolean>>({});
  const {
    leaderboardPointsList,
    // pointsList,
    pointsCategoryList,
    pointsDetail,
    walletAccounts,
    connectedWallet,
    setPointToggleGroup,
  } = useContext(WalletContext);

  const selectedScreen = searchParams.get("tab") ?? 0;

  const { tabsDetails, setShowMobileMenu } = useContext(AirDropContext);

  // const tabsDetails = useMemo(() => {
  //   return pointsCategoryList?.data.map(
  //     (pointByCategory) => pointByCategory.meta
  //   );
  // }, [pointsCategoryList]);

  const activites = useMemo(() => {
    // return (pointsList?.data ?? []).map((point) => ({
    //   title: point.activityName,
    //   point: "?? points/downline",
    //   amount: point.points,
    //   actionText: "Get referral link",
    // }));
    const _points = pointsCategoryList?.data ?? [];
    const _activities = _points.map((el) => el.activities).flat();
    return _activities.map((activity) => {
      return {
        ...activity,
        title: activity.activityName,
        point: `${activity?.points ?? "..."} points`,
        amount: activity?.claimStatus?.[0]?.points ?? "...",
        activity,
        actionText: "" as undefined | string,
        meta: _points.find((e) => e.meta.index === activity?.category.index),
      };
    });
  }, [pointsCategoryList]);

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
  console.log({ pointsCategoryList });

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
      activity: Activity;
    },
    pointsDetail: PointDetailModel | undefined,
    { alwaysConnect }: { alwaysConnect?: boolean } = {
      alwaysConnect: false,
    }
  ) => {
    switch (obj.activity?.type) {
      // case "Follow @mlayer on X":
      case "x-follow":
        if (pointsDetail?.data?.account?.socials?.twitter && !alwaysConnect) {
          if (window != null) {
            const cb = () => {
              makeRequest(MIDDLEWARE_HTTP_URLS.twitter.verify.url, {
                method: MIDDLEWARE_HTTP_URLS.twitter.verify.method,
                body: JSON.stringify({
                  projectId: obj.activity?.projectId,
                  activityId: obj.activity?.id,
                  username: obj.activity.data,
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
            window.open(
              `${FOLLOW_TWITTER_HTTP}/${obj.activity?.data}`,
              "_blank"
            );
          }
        } else {
          if (window != null) {
            informSolidBaseModal(async () => {
              setLoaders((old) => ({ ...old, [obj.title]: true }));
              await makeRequest(MIDDLEWARE_HTTP_URLS.twitter.connect.url, {
                method: MIDDLEWARE_HTTP_URLS.twitter.connect.method,
                body: JSON.stringify({
                  projectId: obj.activity?.projectId,
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
            });
          }
        }

        break;
      case "discord-follow":
        if (pointsDetail?.data?.account?.socials?.discord) {
          // setLoaders((old) => ({ ...old, [obj.title]: true }));
          if (window != null) {
            let serverUrl = FOLLOW_DISCORD_HTTP;
            let name = obj.activity?.data;
            try {
                const parsed = JSON.parse(obj.activity?.data || "{}")
                if (parsed.name) {
                  name = parsed.name;
                  serverUrl = parsed.url
                }
            
              } catch (e) {
                console.log("EEE", e)
              }
           
            window.open(serverUrl, "_blank");
            const cb = () => {
              
              makeRequest(MIDDLEWARE_HTTP_URLS.discord.verify.url, {
                method: MIDDLEWARE_HTTP_URLS.discord.verify.method,
                body: JSON.stringify({
                  projectId: obj.activity?.projectId,
                  activityId: obj.activity?.id,
                  username: name,
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
                projectId: obj.activity?.projectId,
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
              `${window.location.href.split('?')[0]}?uid=${pointsDetail?.data?.account?.socials?.twitter}`
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
      activity: Activity;
    },
    pointsDetail: PointDetailModel | undefined
  ): string => {
    switch (obj.activity?.type) {
      case "x-follow":
        // case "Follow @rulerOfCode on X":
        if (pointsDetail?.data?.account?.socials?.twitter) {
          return "Click to follow @" + obj.activity?.data?.toLocaleLowerCase();
        }
        break;
      case "discord-follow":
        let name = obj.activity?.data;
        if (pointsDetail?.data?.account?.socials?.discord) {
          return "Click to join server";
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
      activity: Activity;
    },
    pointsDetail: PointDetailModel | undefined
  ): string => {
    switch (obj.activity?.type) {
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

  const activitiesComponents = useMemo(() => {
    return activites.map((e, i) => {
      let showCheck = false;
      let isALink =
        e.type == "generic" && e.activity.data?.indexOf("http") == 0;
      if (i < 4 && parseInt(e.amount.toString()) > 0) {
        showCheck = true;
      }
      let actionText;

      if (e.type == "x-follow") {
        actionText = "Connect your X Account";
      }
      if (e.type == "discord-follow") {
        actionText = "Connect your Discord Account";
      }

      if (e.type == "referral") {
        actionText = "Get referral link";
      }
      if (isALink) {
        actionText = e.activity.data ?? "";
      }
      e = { ...e, actionText: actionText };
      return {
        meta: e.meta,
        component: (
          <Fragment key={i}>
            <div className="flex items-center gap-2">
              <div className="flex flex-col w-1/2">
                <span className="text-lg dark:text-grey-200 flex gap-2 items-center">
                  <span>{e.title}</span>
                  {showCheck && (
                    <HeroIcons.CheckCircleIcon className="h-[20px] !text-green-500" />
                  )}
                </span>
                {isALink ? (
                  <a
                    target="_blank"
                    href={actionText}
                    className="text-sm text-blue-500 cursor-pointer"
                  >
                    Proceed
                  </a>
                ) : (
                  <span>
                    {actionText && (
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
                      className="text-sm text-green-700 cursor-pointer"
                    >
                      {loaders[e.title] ? (
                        <Spin />
                      ) : (
                        renderUserName(e as any, pointsDetail)
                      )}
                    </span>
                  </span>
                )}
              </div>
              <span className="dark:text-white">{`${e.point}${
                e?.unit ? `/${e?.unit}` : ""
              }`}</span>
              <span className="dark:text-white text-2xl ml-auto">
                {e.amount}
              </span>
            </div>
          </Fragment>
        ),
      };
    });
  }, [activites]);
  return (
    <motion.div
      className="inline-flex w-full  py-8 px-5 content-center justify-center"
      variants={displayVariants}
      initial={"hidden"}
      animate={"show"}
      exit={{
        opacity: 0,
        scale: 0,
      }}
      // transition={{ duration: 1, delay: 1 }}
    >
      <div className="w-full">
        <div className="max-w-[800px] flex  mx-7 flex-col dark:text-white">
          <span className="">Welcome to the mLayer Airdrop Campaign</span>
          <span className="text-sm">
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
        <div
          onClick={() => {
            setShowMobileMenu?.((old) => !old);
          }}
          className=" mt-4 h-12 w-full bg-secondary rounded border border-borderColor lg:hidden flex items-center justify-between gap-2 cursor-pointer px-4 "
        >
          <span>Select Category</span>
          <MdMenu color="#2F5ED2" className="!opacity-100" size={20} />
        </div>
        <div className="flex my-8  dark:text-white justify-between bg-[url('/background_star.png')] p-5 rounded-lg">
          <span>Total Points Earned</span>
          <span className="text-4xl">
            {pointsDetail?.data?.account?.totalPoints ?? "---"}
          </span>
        </div>

        <div className="flex flex-wrap justify-center lg:grid grid-cols-12 gap-14">
          <div className="lg:col-span-8">
            {tabsDetails?.map((el, index) => {
              if (selectedScreen != index.toString()) {
                return <></>;
              }
              return (
                <motion.div
                  className="flex flex-col border border-borderColor rounded-lg dark:text-white"
                  variants={displayVariants}
                  initial={"hidden"}
                  animate={"show"}
                  exit={{
                    opacity: 0,
                    scale: 0,
                  }}
                  // transition={{ duration: 1, delay: 1 }}

                  key={index}
                >
                  {activitiesComponents
                    .filter(({ meta }) => meta?.meta.index == el.index)
                    .map(({ component }, indexY) => {
                      return (
                        <Fragment key={indexY}>
                          <div className="p-6">Step {indexY + 1}</div>
                          <div className="p-8 bg-secondaryBg mb-5">
                            {component}
                          </div>
                        </Fragment>
                      );
                    })}
                </motion.div>
              );
            })}
          </div>
          <div className="lg:col-span-4">
            <div className="flex flex-col border border-borderColor rounded-lg dark:text-white">
              <span className="py-6 mx-auto font-bold text-xl flex gap-3 items-center">
                <Image
                  src="/badge.svg"
                  alt="Vercel Logo"
                  className="bg-cover mt-1"
                  width={24}
                  height={24}
                  priority
                />
                <span>LEADERBOARD</span>
              </span>
              <hr className="border border-borderColor" />
              <Table
                // bordered
                className="rounded-lg"
                dataSource={leaderboardPointsList?.data ?? []}
                columns={columns}
                loading={loaders["getBlockStats"]}
              />
            </div>
          </div>
        </div>

        <GoToSolidBase
          isModalOpen={showSolidBaseModal}
          onContinue={onContinue}
          onCancel={() => setShowSolidBaseModal(false)}
        />
      </div>
    </motion.div>
  );
};

const columns: ColumnsType<LeaderboardData> = [
  {
    title: "Rank",
    dataIndex: "rank",
    key: "Rank",
    render(value, record, index) {
      return `Rank ${index + 1}`;
    },
  },
  {
    title: "Public Key",
    dataIndex: "public_key",
    key: "Public Key",
    render(value, record, index) {
      return shorternAddress(record.walletAddress);
    },
  },
  {
    title: "Points",
    dataIndex: "points",
    key: "Points",
    render(value, record, index) {
      return record.totalPoints;
    },
  },
];
