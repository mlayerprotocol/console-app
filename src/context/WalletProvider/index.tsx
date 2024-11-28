"use client";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as stargate from "@cosmjs/stargate";
import { MetaMaskProvider, useSDK } from "@metamask/sdk-react";

import { createWeb3Modal } from "@web3modal/wagmi/react";

import {
  CONNECTED_WALLET_STORAGE_KEY,
  KEYPAIR_STORAGE_KEY,
  LOCAL_PRIVKEY_STORAGE_KEY,
  makeRequest,
  metaToObject,
  MIDDLEWARE_HTTP_URLS,
  ML_ACCOUNT_DID_STRING,
  ML_ADDRESS_PREFIX,
  ML_AGENT_DID_STRING,
  ML_CHAIN_ID,
  NODE_HTTP,
  SELECTED_AGENT_STORAGE_KEY,
  SELECTED_SUBNET_STORAGE_KEY,
  Storage,
  VALIDATOR_PUBLIC_KEY,
  WALLET_ACCOUNTS_STORAGE_KEY,
  ZERO_ADDRESS,
} from "@/utils";
import {
  Utils,
  DataType,
  Client,
  ClientPayload,
  AuthorizeEventType,
  Authorization,
  Topic,
  SubscriberRole,
  SubscriptionStatus,
  Address,
  AuthorizationPrivilege,
  Subscription,
  MemberTopicEventType,
  Subnet,
  SignatureData,
  AdminSubnetEventType,
  AdminTopicEventType,
  Message,
  MemberMessageEventType,
  ChainId,
  Device,
} from "@mlayerprotocol/core";

import { notification } from "antd";
import { RESTProvider } from "@mlayerprotocol/core";
import { TopicListModel } from "@/model/topic";
import { AuthenticationListModel } from "@/model/authentications/list";
import { BlockStatsListModel } from "@/model/block-stats";
import { MessageListModel } from "@/model/message/list";
import { MainStatsModel } from "@/model/main-stats/data";
import { SubnetData, SubnetListModel } from "@/model/subnets";
import { PointListModel } from "@/model/points";
import { PointDetailModel } from "@/model/points/detail";
import { SubscriberListModel } from "@/model/subscribers";
import {
  cookieStorage,
  createStorage,
  useAccount,
  useSignMessage,
  WagmiProvider,
} from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { chains, metadata, wagmiConfig, wagmiProjectId } from "../Config";
import { LeaderboardPointListModel } from "@/model/leaderboard";
import { PointByCategoryModel } from "@/model/points/by-category";
import { useParams } from "next/navigation";

// import { Authorization } from "@mlayerprotocol/core/src/entities";
// const { Authorization } = Entities;

interface WalletContextValues {
  initialLoading: boolean;
  initializeKeplr?: () => Promise<void>;
  intializeMetamask?: () => Promise<void>;
  intializeWagmi?: () => Promise<void>;
  generateAgent?: (asNew?: boolean) => Promise<AddressData | undefined>;
  updateAgents?: (newKps: AddressData[]) => Promise<void>;
  generateLocalPrivKeys?: (
    asNew?: boolean,
    address?: string,
    privateKey?: string
  ) => Promise<void>;
  walletAccounts: Record<string, (string | undefined)[]>;
  loadingWalletConnections: Record<string, boolean>;
  walletConnectionState: Record<string, boolean>;
  connectedWallet?: string;
  selectedSubnetId?: string;
  selectedSubnet?: SubnetData;
  selectedAgent?: string;
  selectedMessagesTopicId?: string;

  agents: AddressData[];
  combinedAgents: AddressData[];
  loaders: Record<string, boolean>;
  topicList?: TopicListModel;

  blockStatsList?: BlockStatsListModel;
  mainStatsData?: MainStatsModel;
  messagesList?: MessageListModel;
  pointsList?: PointListModel;
  pointsCategoryList?: PointByCategoryModel;
  leaderboardPointsList?: LeaderboardPointListModel;
  pointsDetail?: PointDetailModel;
  subnetListModelList?: SubnetListModel;
  accountTopicList?: TopicListModel;
  authenticationList?: AuthenticationListModel;
  subscriberTopicList: Record<string, SubscriberListModel> | undefined;
  recordTopicList: Record<string, TopicListModel> | undefined;
  disconnectKeplr?: () => Promise<void>;
  authorizeAgent?: (
    agent: AddressData,
    days: number,
    privilege: AuthorizationPrivilege,
    subnetId?: string
  ) => Promise<void>;
  createTopic?: (
    agent: AddressData,
    name: string,
    description: string,
    reference: string,
    isPublic: boolean,
    dSubRol: SubscriberRole,
    options?: {
      id?: string;
      loaderKey?: string;
      isUpdate?: boolean;
    }
  ) => Promise<void>;
  setSelectedAgent?: Dispatch<SetStateAction<string | undefined>>;
  setCombinedAgents?: Dispatch<SetStateAction<AddressData[]>>;
  subcribeToTopic?: (
    agent: AddressData,
    data: {
      subnetId: string;
      topicId: string;
      sub?: string;
      rol: SubscriberRole;
      status?: SubscriptionStatus;
    }
  ) => Promise<void>;
  sendMessage?: (
    messageString: string,
    agent: AddressData,
    topicId: string
  ) => Promise<void>;

  createSubnet?: (
    // agent: AddressData,
    data: {
      name: string;
      ref: string;
      status: number;
      dAuthPriv: AuthorizationPrivilege;
      update?: boolean;
    }
  ) => Promise<void>;
  setSelectedMessagesTopicId?: Dispatch<SetStateAction<string | undefined>>;
  setSelectedSubnetId?: Dispatch<SetStateAction<string | undefined>>;
  setToggleGroupStats?: Dispatch<SetStateAction<boolean>>;
  setPointToggleGroup?: Dispatch<SetStateAction<boolean>>;
  getTopicSubscribers?: (
    topicId: string,
    params: Record<string, unknown>
  ) => Promise<void>;
  getRecordTopicV2?: (
    status: SubscriptionStatus,
    params: Record<string, unknown>
  ) => Promise<void>;
}

declare const TextEncoder: any;
declare const TextDecoder: any;

export function toUtf8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}
function sortedObject(obj: any): any {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortedObject);
  }
  const sortedKeys = Object.keys(obj).sort();
  const result: Record<string, any> = {};
  // NOTE: Use forEach instead of reduce for performance with large objects eg Wasm code
  sortedKeys.forEach((key) => {
    result[key] = sortedObject(obj[key]);
  });
  return result;
}
export function escapeCharacters(input: string): string {
  // When we migrate to target es2021 or above, we can use replaceAll instead of global patterns.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll
  const amp = /&/g;
  const lt = /</g;
  const gt = />/g;
  return input
    .replace(amp, "\\u0026")
    .replace(lt, "\\u003c")
    .replace(gt, "\\u003e");
}
export function sortedJsonStringify(obj: any): string {
  const strigified = JSON.stringify(sortedObject(obj));
  console.log("STRINGIFIED", strigified);
  return strigified;
}

export function serializeSignDoc(signDoc: any): Uint8Array {
  const serialized = escapeCharacters(sortedJsonStringify(signDoc));
  console.log("Escaped", serialized);
  const utf = toUtf8(serialized);
  console.log("UTF8ed", JSON.stringify(utf));
  return utf;
}

export const WalletContext = createContext<WalletContextValues>({
  initialLoading: false,
  loaders: {},
  walletAccounts: {},
  loadingWalletConnections: {},
  walletConnectionState: {},
  agents: [],
  combinedAgents: [],
  subscriberTopicList: {},
  recordTopicList: {},
});

export const WalletContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { address: wagmiAddress } = useAccount();

  const [walletAccounts, setWalletAccounts] = useState<
    Record<string, (string | undefined)[]>
  >({});
  const [loadingWalletConnections, setLoadingWalletConnections] = useState<
    Record<string, boolean>
  >({});
  const [walletConnectionState, setWalletConnectionState] = useState<
    Record<string, boolean>
  >({});
  const [connectedWallet, setConnectedWallet] = useState<string>();
  const [selectedSubnetId, setSelectedSubnetId] = useState<string>();
  const [selectedSubnet, setSelectedSubnet] = useState<SubnetData>();
  const [toggleGroup1, setToggleGroup1] = useState<boolean>(false);
  const [toggleGroup2, setToggleGroup2] = useState<boolean>(false);
  const [toggleGroup3, setToggleGroup3] = useState<boolean>(false);
  const [toggleGroup4, setToggleGroup4] = useState<boolean>(false);
  const [pointToggleGroup, setPointToggleGroup] = useState<boolean>(false);
  const [toggleGroupStats, setToggleGroupStats] = useState<boolean>(false);
  const [selectedAgent, setSelectedAgent] = useState<string>();
  const [selectedMessagesTopicId, setSelectedMessagesTopicId] =
    useState<string>();
  const { sdk, connected, connecting, provider, chainId } = useSDK();
  const [cosmosSDK, setCosmosSDK] = useState<stargate.StargateClient>();
  const [agents, setAgents] = useState<AddressData[]>([]);
  const [localPrivKey, setLocalPrivKey] = useState<Record<string, string>>({});
  const [combinedAgents, setCombinedAgents] = useState<AddressData[]>([]);
  const [keplrSignature, setKeplrSignature] = useState<Record<string, any>>();
  const chainIds: Record<string, string> = { keplr: "cosmoshub-4" };

  const [loaders, setLoaders] = useState<Record<string, boolean>>({});

  const [topicList, setTopicList] = useState<TopicListModel>();
  const [accountTopicList, setAccountTopicList] = useState<TopicListModel>({
    data: [],
  });

  const [recordTopicList, setRecordTopicList] =
    useState<Record<string, TopicListModel>>();
  const [subscriberTopicList, setSubscriberTopicList] =
    useState<Record<string, SubscriberListModel>>();
  const [subnetListModelList, setSubnetListList] = useState<SubnetListModel>();
  const [blockStatsList, setBlockStatsList] = useState<BlockStatsListModel>();
  const [mainStatsData, setMainStatsData] = useState<MainStatsModel>();
  const [messagesList, setMessagesList] = useState<MessageListModel>();
  const [pointsList, setPointsList] = useState<PointListModel>();
  const [pointsCategoryList, setPointsCategoryList] =
    useState<PointByCategoryModel>();
  const [leaderboardPointsList, setLeaderboardPointsList] =
    useState<LeaderboardPointListModel>();
  const [pointsDetail, setPointsDetail] = useState<PointDetailModel>();
  const [authenticationList, setAuthenticationList] =
    useState<AuthenticationListModel>();
  const { signMessage } = useSignMessage();

  const connectedStorage = useMemo(
    () => new Storage(CONNECTED_WALLET_STORAGE_KEY),
    []
  );
  const wallectAccountsStorage = useMemo(
    () => new Storage(WALLET_ACCOUNTS_STORAGE_KEY),
    []
  );

  const selectedAgentStorage = useMemo(
    () => new Storage(SELECTED_AGENT_STORAGE_KEY),
    []
  );

  const selectedSubnetStorage = useMemo(
    () => new Storage(SELECTED_SUBNET_STORAGE_KEY),
    []
  );

  useEffect(() => {
    console.log({ wagmiAddresswagmiAddresswagmiAddress: wagmiAddress });
    if (!wagmiAddress) {
      setWalletAccounts({ wagmi: [] });
    }
    setWalletAccounts((old) => {
      return { ...old, wagmi: [wagmiAddress] };
    });
    makeRequest(MIDDLEWARE_HTTP_URLS.connect.url, {
      method: MIDDLEWARE_HTTP_URLS.claim.method,
      body: JSON.stringify({
        account: Address.fromString(wagmiAddress ?? "").toAddressString(),
      }),
    }).then((b) => {
      setPointToggleGroup((old) => !old);
    });
  }, [wagmiAddress]);

  useEffect(() => {
    const subAgent = agents.find((d) => d.subnetId == selectedSubnetId);
    console.log("SUBNETAGENT", subAgent, selectedAgent);
    if (subAgent) {
      const sel = agents.find((d) => d.address == selectedAgent);
      if (sel?.subnetId != selectedSubnetId) {
        setSelectedAgent(subAgent.address);
      }
    }
  }, [agents, selectedSubnetId]);

  const disconnectKeplr = async () => {
    if (window.keplr) {
      const chainId = chainIds.keplr;
      await window.keplr.disable(chainId);
      setWalletAccounts({ keplr: [] });
      setConnectedWallet(undefined);
      connectedStorage?.set(null);
    }
  };

  const initializeKeplr = async () => {
    if (!window.keplr) {
      notification.error({ message: "Please install keplr extension" });
    } else {
      const chainId = chainIds.keplr;

      // Enabling before using the Keplr is recommended.
      // This method will ask the user whether to allow access if they haven't visited this website.
      // Also, it will request that the user unlock the wallet if the wallet is locked.
      setLoadingWalletConnections((old) => {
        return { ...old, keplr: true };
      });
      await window.keplr.enable(chainId);

      const offlineSigner = window.keplr.getOfflineSigner(chainId);

      // You can get the address/public keys by `getAccounts` method.
      // It can return the array of address/public key.
      // But, currently, Keplr extension manages only one address/public key pair.
      // XXX: This line is needed to set the sender address for SigningCosmosClient.
      const accounts = await offlineSigner.getAccounts();
      if (accounts.length == 0) {
        disconnectKeplr();
        return;
      }

      // Initialize the gaia api with the offline signer that is injected by Keplr extension.
      // setTimeout(() => {
      // const cosmJS = await stargate.SigningStargateClient.connect(
      //   // "https://lcd-cosmoshub.keplr.app/rest"

      //   "https://cosmos-rpc.publicnode.com:443"
      //   // accounts[0].address
      //   // offlineSigner
      // );
      // const signature = await window.keplr.signArbitrary(
      //   chainId,
      //   accounts[0].address,
      //   "Hello World"
      // );
      // setKeplrSignature(signature);
      // setCosmosSDK(cosmJS);
      setLoadingWalletConnections((old) => {
        return { ...old, keplr: false };
      });
      setWalletAccounts((old) => {
        return { ...old, keplr: accounts.map((el: any) => el.address) };
      });
      setConnectedWallet("keplr");
      makeRequest(MIDDLEWARE_HTTP_URLS.connect.url, {
        method: MIDDLEWARE_HTTP_URLS.claim.method,
        body: JSON.stringify({
          account: Address.fromString(
            accounts[0].address ?? ""
          ).toAddressString(),
        }),
      }).then((b) => {
        setPointToggleGroup((old) => !old);
      });
    }
  };
  const intializeMetamask = async () => {
    try {
      setLoadingWalletConnections((old) => {
        return { ...old, metamask: true };
      });
      // const accounts: any = await sdk?.connect();
      // console.log({ e: "intializeMetamask", chainId, connected, accounts });

      // setWalletAccounts((old) => {
      //   return { ...old, metamask: accounts };
      // });
      setConnectedWallet("metamask");
    } catch (err) {
      console.warn("failed to connect..", err);
    }
    setLoadingWalletConnections((old) => {
      return { ...old, metamask: false };
    });
  };

  const intializeWagmi = async () => {
    try {
      setLoadingWalletConnections((old) => {
        return { ...old, wagmi: true };
      });
      // const accounts: any = await sdk?.connect();
      // console.log({ e: "intializeMetamask", chainId, connected, accounts });

      setWalletAccounts((old) => {
        return { ...old, wagmi: [wagmiAddress as string] };
      });
      setConnectedWallet("wagmi");
    } catch (err) {
      console.warn("failed to connect..", err);
    }
    setLoadingWalletConnections((old) => {
      return { ...old, wagmi: false };
    });
  };
  const params = useParams<Record<string, string>>();

  const disconnectMetamask = () => {
    if (sdk) {
      sdk.terminate();
    }
  };

  useEffect(() => {
    if (!topicList && !!selectedSubnetId) {
     getTopics(selectedSubnetId);
    }

    if (agents.length > 0) return;
    generateAgent(true);
    generateLocalPrivKeys(true);
  }, [selectedSubnetId]);
  useEffect(() => {
    initializeOldState();
  }, []);

  useEffect(() => {
    getBlockStats({});
    getMainStats({});
  }, [toggleGroupStats]);

  useEffect(() => {
    makeRequest(`${MIDDLEWARE_HTTP_URLS.leaderBoard.url}`, {
      method: MIDDLEWARE_HTTP_URLS.account.method,
    })
      .then((b) => b?.json())
      .then((resp) => {
        setLeaderboardPointsList(resp);
        // console.log({
        //   leaderBoard: MIDDLEWARE_HTTP_URLS.leaderBoard.url,
        //   resp: resp.data,
        // });
      })
      .catch((e) => notification.error({ message: e }));
  }, []);

  useEffect(() => {
    const subnet = (subnetListModelList?.data ?? []).find(
      (opt) => opt.id == selectedSubnetId
    );
    setSelectedSubnet(subnet);
  }, [selectedSubnetId, subnetListModelList]);

  useEffect(() => {
    if (!params?.subnetId) return;
    setSelectedSubnetId(params?.subnetId);
  }, [params]);

  useEffect(() => {
    if (!selectedMessagesTopicId) return;
    getTopicMessages(selectedMessagesTopicId, {});
  }, [selectedMessagesTopicId, toggleGroup3]);
  useEffect(() => {
    if (!connectedWallet || !walletAccounts[connectedWallet]?.[0]) return;
    getAccountSubnets({
      params: {
        acct: Address.fromString(
          walletAccounts[connectedWallet]?.[0] ?? ""
        ).toAddressString(),
      },
    });
  }, [connectedWallet, toggleGroup4, walletAccounts]);

  useEffect(() => {
    if (connectedWallet) connectedStorage?.set(connectedWallet);
    if (Object.keys(walletAccounts).length > 0)
      wallectAccountsStorage?.set(walletAccounts);
    if (selectedAgent) selectedAgentStorage?.set(selectedAgent);
    if (selectedSubnetId) selectedSubnetStorage?.set(selectedSubnetId);
    console.log({
      connectedWallet,
      walletAccounts,
      selectedAgent,
      selectedSubnetId,
    });
  }, [connectedWallet, selectedAgent, selectedSubnetId, walletAccounts]);

  useEffect(() => {
    window.addEventListener("keplr_keystorechange", () => {
      initializeKeplr?.();
    });
  }, []);

  useEffect(() => {}, []);

  useEffect(() => {
    if (
      !connectedWallet ||
      walletAccounts?.[connectedWallet].length == 0 ||
      !walletAccounts[connectedWallet]?.[0]
    )
      return;
    if (Object.keys(walletAccounts).length == 0) return;
    getAuthorizations({
      params: {
        acct: Address.fromString(
          walletAccounts[connectedWallet]?.[0] ?? ""
        ).toAddressString(),
      },
    });
  }, [connectedWallet, walletAccounts, toggleGroup1]);

  useEffect(() => {
    if (!connectedWallet) return;
    if (Object.keys(walletAccounts).length == 0) return;

    getAccountSubscriptions({
      params: {
        acct: Address.fromString(
          walletAccounts[connectedWallet]?.[0] ?? ""
        ).toAddressString(),
        snet: selectedSubnetId,
      },
    });
  }, [connectedWallet, walletAccounts, toggleGroup2]);

  useEffect(() => {
    const serverAgents: AddressData[] = [];
    const localAgents: AddressData[] = [...agents];

    (authenticationList?.data ?? []).forEach((authEl) => {
      const idx: number = localAgents.findIndex((agt) => {
        return (
          agt.address == authEl.agt ||
          Address.fromString(agt.address).toAddressString() == authEl.agt
        );
      });
      if (idx != -1) {
        localAgents[idx].authData = authEl;
      } else {
        serverAgents.push({
          address: authEl.agt,
          authData: authEl,
          privateKey: localPrivKey[authEl.agt] ?? undefined,
        } as AddressData);
      }
    });

    setCombinedAgents([
      ...(localAgents ?? []).filter((agt) => selectedSubnetId == agt.subnetId),
      ...(serverAgents ?? []).filter(
        (agt) => selectedSubnetId == agt?.authData?.snet
      ),
    ]);
  }, [agents, authenticationList, selectedSubnetId]);
  useEffect(() => {
    const account =
      walletAccounts?.[connectedWallet ?? ""]?.[0] ?? ZERO_ADDRESS;
    // if (!connectedWallet && !account) return;
    makeRequest(
      `${MIDDLEWARE_HTTP_URLS.account.url}/${Address.fromString(
        account
      ).toAddressString()}/points`,
      {
        method: MIDDLEWARE_HTTP_URLS.account.method,
      }
    )
      .then((b) => b?.json())
      .then((resp) => {
        setPointsList(resp);
        console.log({ resp: resp.data });
      })
      .catch((e) => notification.error({ message: e }));
    makeRequest(
      `${MIDDLEWARE_HTTP_URLS.account.url}/${Address.fromString(
        account
      ).toAddressString()}/points-by-category`,
      {
        method: MIDDLEWARE_HTTP_URLS.account.method,
      }
    )
      .then((b) => b?.json())
      .then((resp) => {
        setPointsCategoryList(resp);
        console.log({ resp: resp.data });
      })
      .catch((e) => notification.error({ message: e }));

    makeRequest(`${MIDDLEWARE_HTTP_URLS.account.url}/did:${account}`, {
      method: MIDDLEWARE_HTTP_URLS.account.method,
    })
      .then((b) => b?.json())
      .then((resp) => {
        setPointsDetail(resp);
        console.log({ resp: resp.data });
      })
      .catch((e) => notification.error({ message: e }));
  }, [connectedWallet, pointToggleGroup]);
  const ganerateAuthorizationMessage = async (
    account: AddressData,
    agent: AddressData,
    days: number = 30,
    privilege: AuthorizationPrivilege,
    subnetId?: string
  ) => {
    subnetId ??= selectedSubnetId;
    if (subnetId == null) {
      notification.error({ message: "No Subnet Selected" });
      throw Error("No Subnet Selected");
      // return;
    }
    const authority: Authorization = new Authorization();
    // console.log("keypairsss", Utils.generateKeyPairSecp());
    // console.log(
    //   "BECH32ADDRESS",
    //   validatorPublicKey,
    //   Utils.toAddress(Buffer.from(validatorPublicKey, "hex"))
    // );
    authority.account = Address.fromString(account.publicKey);
    authority.agent = Device.fromString(agent.address);
    authority.grantor = Address.fromString(account.publicKey);
    authority.timestamp = Date.now();
    authority.topicIds = "*";
    authority.privilege = privilege;
    authority.subnet = subnetId;
    authority.duration = days * 24 * 60 * 60 * 1000; // 30 days
    // console.log({ authority });
    const encoded = authority.encodeBytes();
    // console.log("ID::::", { authority, encoded });

    return authority;
  };

  // const authorize = async (
  //   authSig: string,
  //   type: string,
  //   authority: Authorization,
  //   validatorPublicKey: string,
  //   account: AddressData,
  //   payload: ClientPayload<Authorization>
  // ) => {

  //   // console.log("Grant", authority.asPayload());

  //   // payload.signature = Utils.signMessageEcc(pb, agent.privateKey);
  //   // console.log({ p: payload.asPayload() });
  //   // console.log("Payload", JSON.stringify(payload.asPayload()));

  //   authority.signatureData = new SignatureData(
  //     type as any,
  //     account.publicKey,
  //     authSig
  //   );

  //   const client = new Client(new RESTProvider(NODE_HTTP));
  //   const auth = await client.authorize(payload);
  //   if (auth.error) {
  //     notification.error({ message: auth.error + "" });
  //   }
  //   return auth;
  //   // console.log("AUTHORIZE", auth, "rr", auth.error);
  // };

  const authorizeAgent = async (
    agent: AddressData,
    days: number = 30,
    privilege: AuthorizationPrivilege = AuthorizationPrivilege.Member,
    subnetId: string
  ) => {
    if (connectedWallet == null) {
      notification.error({ message: "No wallet connected" });
      return;
    }
    console.log("ACCOUNTS::::", walletAccounts);
    const account = walletAccounts[connectedWallet][0];
    if (account == null) {
      notification.error({ message: "No account found" });
      return;
    }
    setLoaders((old) => ({ ...old, authorizeAgent: true }));
    await ganerateAuthorizationMessage(
      {
        address: account,
        publicKey: account,
        privateKey: "",
      },
      agent,
      days,
      privilege,
      subnetId
    )
      .then(async (authority) => {
        // console.log({ authority });
        if (!window.keplr) {
          notification.error({ message: "Please install keplr extension" });
          return;
        }
       
        const payload: ClientPayload<Authorization> = new ClientPayload();
        console.log({ authority3: authority });
        payload.data = authority;
        payload.timestamp = Date.now();
        console.log('EVENTTYPE', ChainId);
        payload.eventType = AuthorizeEventType.AuthorizeEvent;
        payload.validator = String(VALIDATOR_PUBLIC_KEY);
        const pb = payload.encodeBytes();

        const hash = Utils.keccak256Hash(pb).toString("base64");

        const message = JSON.stringify({
          entity: `Authorization`,
          network: ML_CHAIN_ID,
          identifier: `${authority.agent.address}`,
          hash: `${hash}`,
        }).replace(/\\s+/g, "");

        try {
          if (connectedWallet == "keplr") {
            const signatureResp = await window.keplr.signArbitrary(
              chainIds[connectedWallet],
              account,
              message
            );
            authority.signatureData = new SignatureData(
              signatureResp.pub_key.type as any,
              signatureResp.pub_key.value,
              signatureResp.signature
            );
          } else {
            // const msgHash = Utils.keccak256Hash(Buffer.from(message));
            const signatureRespEth = await signEth(message, account);
            authority.signatureData = new SignatureData(
              "eth",
              signatureRespEth.variables.account,
              signatureRespEth.data ?? ""
            );
          }
        } catch (e: any) {
          if (e.error && String(e.error).includes("UserRejectedRequestError")) {
            setLoaders((old) => ({ ...old, authorizeAgent: false }));
            return;
          }
          setLoaders((old) => ({ ...old, authorizeAgent: false }));
          return;
        }

        console.log("SUBNETID::::", subnetId, selectedSubnetId);
        const client = new Client(new RESTProvider(NODE_HTTP));
        client
          .authorize(payload)
          .then((ev: any) => {
            const client = new Client(new RESTProvider(NODE_HTTP));

            const event = ev?.data?.event;
            client.resolveEvent({ type: event?.t, id: event?.id }).then((e) => {
              getAuthorizations({
                params: {
                  snet: selectedSubnetId,
                  acct: `${Address.fromString(account).toAddressString()}`,
                },
              });
              setToggleGroup2((old) => !old);
              makeRequest(MIDDLEWARE_HTTP_URLS.claim.url, {
                method: MIDDLEWARE_HTTP_URLS.claim.method,
                body: JSON.stringify({
                  event: event.t,
                  account: `${Address.fromString(account).toAddressString()}`,
                }),
              }).then((b) => {
                setPointToggleGroup((old) => !old);
              });
            });
          })
          .finally(() => {
            setLoaders((old) => ({ ...old, authorizeAgent: false }));
            setToggleGroup1((old) => !old);
          }).catch(e => {
             notification.error({ message: e?.response?.data?.error + "" });
          });
      })
      .catch((r) => {
        console.log({ r });
        setLoaders((old) => ({ ...old, authorizeAgent: false }));
       
      });
  };

  const generateAgent = async (asNew?: boolean) => {
    if (typeof window !== "undefined") {
      const storage = new Storage(KEYPAIR_STORAGE_KEY);
      // console.log({ KEYPAIR_STORAGE_KEY, storage: storage.get() });
      if (selectedSubnetId == null) {
        return;
        // return;
      }
      if (asNew && storage.get()) {
        setAgents(storage.get());
        return;
      }
      const kp: AddressData = Utils.generateKeyPairEcc();
      kp.subnetId = selectedSubnetId;
      const newKps: AddressData[] = [...agents, kp];

      updateAgents(newKps);
      return kp;
    }
  };

  const updateAgents = async (newKps: AddressData[]) => {
    if (typeof window !== "undefined") {
      const storage = new Storage(KEYPAIR_STORAGE_KEY);

      setAgents(newKps);
      storage.set(newKps);
    }
  };

  const generateLocalPrivKeys = async (
    asNew?: boolean,
    address?: string,
    privateKey?: string
  ) => {
    if (typeof window !== "undefined") {
      const storage = new Storage(LOCAL_PRIVKEY_STORAGE_KEY);

      if (asNew && storage.get()) {
        setLocalPrivKey(storage.get());
        return;
      }
      if (!address) return;
      const newLPK = { ...localPrivKey, [address]: privateKey ?? "" };
      setLocalPrivKey(newLPK);
      storage.set(newLPK);
    }
  };

  const initializeOldState = async () => {
    if (typeof window !== "undefined") {
      if (connectedStorage.get()) {
        setConnectedWallet(connectedStorage.get());
      }
      if (wallectAccountsStorage.get()) {
        setWalletAccounts(wallectAccountsStorage.get());
      }

      if (selectedAgentStorage.get()) {
        setSelectedAgent(selectedAgentStorage.get());
      }

      // if (selectedSubnetStorage.get()) {
      //   setSelectedSubnetId(selectedSubnetStorage.get());
      // }
      // console.log({
      //   CONNECTED_WALLET_STORAGE_KEY,
      //   WALLET_ACCOUNTS_STORAGE_KEY,
      //   storage: connectedStorage,
      // });
    }
  };

  const createTopic = async (
    agent: AddressData,
    name: string,
    description: string,
    reference: string,
    isPublic: boolean,
    dSubRol: SubscriberRole,
    options?: {
      id?: string;
      loaderKey?: string;
      isUpdate?: boolean;
    }
  ) => {
    if (connectedWallet == null) {
      notification.error({ message: "No wallet connected" });
      return;
    }
    const account = walletAccounts[connectedWallet][0];
    if (account == null || account == "") {
      notification.error({ message: "No account found" });
      return;
    }
    if (selectedSubnetId == null) {
      notification.error({ message: "No Subnet Selected" });
      throw Error("No Subnet Selected");
      // return;
    }
    const { loaderKey, isUpdate = false, id } = options ?? {};
    setLoaders((old) => ({ ...old, [loaderKey ?? "createTopic"]: true }));
    try {
      const topic: Topic = new Topic();
      //console.log('keypairsss', Utils.generateKeyPairSecp());
      // console.log(
      //   'BECH32ADDRESS',
      //   validator.publicKey,
      //   Utils.toAddress(Buffer.from(validator.publicKey, 'hex'))
      // );

      topic.meta = JSON.stringify({ name, description });
      topic.ref = reference;
      topic.public = isPublic;
      topic.id = id ?? "";
      topic.subnet = selectedSubnetId;
      console.log("UUIDBYTES", topic.subnet, Utils.uuidToBytes(topic.subnet));
      topic.defaultSubscriberRole = dSubRol;
      const payload: ClientPayload<Topic> = new ClientPayload();
      payload.data = topic;
      payload.chainId = new ChainId(ML_CHAIN_ID);
      console.log(
        "CHAINID::",
        payload.chainId.bytes(),
        payload.chainId.bytes().toString("hex")
      );
      payload.timestamp = Date.now();
      payload.subnet = selectedSubnetId;
      payload.eventType = isUpdate
        ? AdminTopicEventType.UpdateTopic
        : AdminTopicEventType.CreateTopic;
      payload.validator = String(VALIDATOR_PUBLIC_KEY);
      payload.account = Address.fromString(account);
      payload.nonce = 0;
      const pb = payload.encodeBytes();
      console.log("PAYLLOAD", payload, pb);
      console.log("HEXDATA", pb.toString("hex"));
      payload.signature = await Utils.signMessageEcc(pb, agent.privateKey);
      console.log("Payload", JSON.stringify(payload.asPayload()));

      const client = new Client(new RESTProvider(NODE_HTTP));
      var auth: any;
      if (isUpdate) {
        auth = await client.updateTopic(payload);
      } else {
        auth = await client.createTopic(payload);
      }

      const event = auth?.data?.event;
      console.log("AUTHORIZE", "event", event?.id, event?.t);
      client.resolveEvent({ type: event?.t, id: event?.id }).then((e) => {
        getTopics(selectedSubnetId);
        setToggleGroup2((old) => !old);
        makeRequest(MIDDLEWARE_HTTP_URLS.claim.url, {
          method: MIDDLEWARE_HTTP_URLS.claim.method,
          body: JSON.stringify({
            event: event.t,
            account: `${Address.fromString(account).toAddressString()}`,
          }),
        }).then((b) => {
          setPointToggleGroup((old) => !old);
        });
      });
    } catch (e: any) {
      console.log("AUTHORIZE error", e);
      notification.error({ message: e?.response?.data?.error + "" });
    }
    setLoaders((old) => ({ ...old, [loaderKey ?? "createTopic"]: false }));
  };

  const getTopics = async (subnetId?: string) => {
    if (loaders["getTopic"] || !subnetId) return;
    setLoaders((old) => ({ ...old, getTopic: true }));
    try {
      const client = new Client(new RESTProvider(NODE_HTTP));
      const respond: TopicListModel = (await client.getTopics(
        {params: {snet: subnetId}}
      )) as unknown as TopicListModel;
      if ((respond as any)?.error) {
        notification.error({ message: (respond as any)?.error + "" });
      }
      setTopicList(respond);
      // console.log("getTopics::::", respond);
    } catch (error) {}
    setLoaders((old) => ({ ...old, getTopic: false }));
  };

  const getAuthorizations = async (params: Record<string, unknown>) => {
    if (loaders["getAuthorizations"]) return;
    setLoaders((old) => ({ ...old, getAuthorizations: true }));
    try {
      const client = new Client(new RESTProvider(NODE_HTTP));
      const respond: AuthenticationListModel = (await client.getAuthorizations(
        params
      )) as unknown as AuthenticationListModel;
      if ((respond as any)?.error) {
        notification.error({ message: (respond as any)?.error + "" });
      }

      setAuthenticationList(respond);
    } catch (error) {}
    setLoaders((old) => ({ ...old, getAuthorizations: false }));
  };

  const subcribeToTopic = async (
    agent: AddressData,

    {
      subnetId,
      topicId,
      sub,
      status,
      rol,
      ref,
    }: {
      subnetId: string;
      topicId: string;
      sub?: string;
      status?: SubscriptionStatus;
        rol: SubscriberRole;
        ref: string;
    }
  ) => {
    if (connectedWallet == null) {
      notification.error({ message: "No wallet connected" });
      return;
    }
    const account = walletAccounts[connectedWallet][0];
    if (account == null || account == "") {
      notification.error({ message: "No account found" });
      return;
    }
    setLoaders((old) => ({ ...old, [`subcribeToTopic-${topicId}`]: true }));
    try {
      const subscribe: Subscription = new Subscription();
      //console.log('keypairsss', Utils.generateKeyPairSecp());
      // console.log(
      //   'BECH32ADDRESS',
      //   validator.publicKey,
      //   Utils.toAddress(Buffer.from(validator.publicKey, 'hex'))
      // );
      console.log("STATUSS", status, rol);
      subscribe.status = status ?? SubscriptionStatus.Invited;
      subscribe.role = rol;
      subscribe.subnet = subnetId;
      subscribe.topic = topicId;
      subscribe.ref = ref;
      subscribe.subscriber = Address.fromString(sub ?? account);
      //   subscribe.agent = "Bitcoin world";
      //   subscribe.reference = "898989";

      const payload: ClientPayload<Subscription> = new ClientPayload();
      payload.chainId = new ChainId(ML_CHAIN_ID);
      payload.data = subscribe;
      payload.subnet = subnetId;
      payload.timestamp = Date.now();
      payload.eventType = MemberTopicEventType.SubscribeEvent;
      payload.validator = String(VALIDATOR_PUBLIC_KEY);
      payload.account = Address.fromString(account);
      const pb = payload.encodeBytes();
      console.log("🚀 ~ main ~ pb:", pb.toString("hex"));
      payload.signature = await Utils.signMessageEcc(pb, agent.privateKey);
      console.log("Payload", JSON.stringify(payload.asPayload()));

      const client = new Client(new RESTProvider(NODE_HTTP));
      const auth: any = await client.createSubscription(payload);

      const event = auth?.data;
      await client.resolveEvent({ type: event?.t, id: event?.id }).then((e) => {
        getTopics(selectedSubnetId);
        setToggleGroup2((old) => !old);
        makeRequest(MIDDLEWARE_HTTP_URLS.claim.url, {
          method: MIDDLEWARE_HTTP_URLS.claim.method,
          body: JSON.stringify({
            event: event.t,
            account: `${Address.fromString(account).toAddressString()}`,
          }),
        }).then((b) => {
          setPointToggleGroup((old) => !old);
        });
      });
    } catch (e: any) {
      console.log("AUTHORIZE error", e);
      notification.error({ message: e?.response?.data?.error + "" });
    }
    setLoaders((old) => ({ ...old, [`subcribeToTopic-${topicId}`]: false }));
  };
  const getAccountSubscriptions = async (params: Record<string, unknown>) => {
    if (loaders["getAccountSubscriptions"]) return;
    setLoaders((old) => ({ ...old, getAccountSubscriptions: true }));
    try {
      const client = new Client(new RESTProvider(NODE_HTTP));
      const respond: TopicListModel = (await client.getTopics(
        params
      )) as unknown as TopicListModel;
      if ((respond as any)?.error) {
        notification.error({ message: (respond as any)?.error + "" });
      }
      respond.data = Array.isArray(respond.data)
        ? respond.data
        : [respond.data];
      setAccountTopicList(respond);
      // console.log("getAccountSubscriptions::::", respond);
    } catch (error) {}
    setLoaders((old) => ({ ...old, getAccountSubscriptions: false }));
  };
  const getRecordTopicV2 = async (
    status: SubscriptionStatus,
    params: Record<string, unknown>
  ) => {
    if (loaders["getRecordTopicV2"]) return;
    setLoaders((old) => ({ ...old, getRecordTopicV2: true }));
    try {
      const client = new Client(new RESTProvider(NODE_HTTP));
      const respond: TopicListModel = (await client.getAccountSubscriptions(
        params
      )) as unknown as TopicListModel;
      if ((respond as any)?.error) {
        notification.error({ message: (respond as any)?.error + "" });
      }
      setRecordTopicList((old) => ({ ...old, [status]: respond }));
      // setAccountTopicList(respond);
      // console.log("getRecordTopicV2::::", respond);setRecordTopicList
    } catch (error) {}
    setLoaders((old) => ({ ...old, getRecordTopicV2: false }));
  };

  const getTopicSubscribers = async (
    topicId: string,
    params: Record<string, unknown>
  ) => {
    if (loaders["getTopicSubscribers"]) return;
    setLoaders((old) => ({ ...old, getTopicSubscribers: true }));
    try {
      const client = new Client(new RESTProvider(NODE_HTTP));
      const respond: SubscriberListModel = (await client.getTopicSubscribers(
        params
      )) as unknown as SubscriberListModel;
      if ((respond as any)?.error) {
        notification.error({ message: (respond as any)?.error + "" });
      }
      setSubscriberTopicList((old) => ({ ...old, [topicId]: respond }));
      // console.log("getTopicSubscribers::::", respond);
    } catch (error) {}
    setLoaders((old) => ({ ...old, getTopicSubscribers: false }));
  };

  const sendMessage = async (
    messageString: string,
    agent: AddressData,
    topicId: string
  ) => {
    if (connectedWallet == null) {
      notification.error({ message: "No wallet connected" });
      return;
    }
    const account = walletAccounts[connectedWallet][0];
    if (account == null || account == "") {
      notification.error({ message: "No account found" });
      return;
    }
    if (selectedSubnetId == null) {
      notification.error({ message: "No Subnet Selected" });
      throw Error("No Subnet Selected");
      // return;
    }
    setLoaders((old) => ({ ...old, sendMessage: true }));
    try {
      const message: Message = new Message();
      message.topic = topicId;
      message.sender = Address.fromString(account);
      message.data = Buffer.from(messageString);
      message.dataType = DataType.TXT;
      message.nonce = Date.now();
      // message.attachments = messagettachments.map((item) => item.asPayload());
      // message.actions = messageActions.map((item) => item.asPayload());

      const payload: ClientPayload<Message> = new ClientPayload();

      payload.chainId = new ChainId(ML_CHAIN_ID);
      payload.data = message;
      payload.timestamp = Date.now();
      payload.eventType = MemberMessageEventType.SendMessageEvent;
      payload.validator = VALIDATOR_PUBLIC_KEY;
      payload.account = Address.fromString(account);
      payload.nonce = 0;

      payload.subnet = selectedSubnetId;
      const pb = payload.encodeBytes();
      console.log("HEXDATA", pb.toString("hex"));
      console.log("PAYLOAOOD", pb);
      payload.signature = await Utils.signMessageEcc(pb, agent.privateKey);
      console.log("Payload::::", payload.data.data);
      console.log("Payload", JSON.stringify(payload.asPayload()));

      const client = new Client(new RESTProvider(NODE_HTTP));
      const resp: any = await client.createMessage(payload);

      const event = resp?.data;
      console.log("AUTHORIZE", "resp", resp, "event", event?.id, event?.t);
      client.resolveEvent({ type: event?.t, id: event?.id }).then((e) => {
        setToggleGroup3((old) => !old);
        makeRequest(MIDDLEWARE_HTTP_URLS.claim.url, {
          method: MIDDLEWARE_HTTP_URLS.claim.method,
          body: JSON.stringify({
            event: event.t,
            account: Address.fromString(account).toAddressString(),
          }),
        }).then((b) => {
          setPointToggleGroup((old) => !old);
        });
      });
    } catch (e: any) {
      console.log("AUTHORIZE error", e);
      notification.error({ message: e?.response?.data?.error + "" });
    }
    setLoaders((old) => ({ ...old, sendMessage: false }));
  };

  const signEth: (
    message: string | { raw: `0x${string}` },
    signer: string
  ) => Promise<{
    data?: string;
    error?: string;
    variables: any;
    context: any;
  }> = async (message: string | { raw: `0x${string}` }, signer: any) => {
    return new Promise<{
      data?: string;
      error?: string;
      variables: any;
      context: any;
    }>((resolve, reject) => {
      signMessage(
        { account: signer, message: message },
        {
          onSuccess(data, variables, context) {
            resolve({ data: data, variables, context });
          },
          onError(error, variables, context) {
            reject({ error, variables, context });
          },
        }
      );
    });
  };

  const createSubnet = async (
    // agent: AddressData,
    {
      name,
      ref,
      status,
      dAuthPriv,
      update,
    }: {
      name: string;
      ref: string;
      status: number;
      dAuthPriv: AuthorizationPrivilege;
      update?: boolean;
    }
  ) => {
    if (!window.keplr) {
      notification.error({ message: "Please install keplr extension" });
      return;
    }
    if (connectedWallet == null) {
      notification.error({ message: "No wallet connected" });
      return;
    }
    const account = walletAccounts[connectedWallet][0];
    if (account == null || account == "") {
      notification.error({ message: "No account found" });
      return;
    }
    setLoaders((old) => ({ ...old, createSubnet: true }));

    try {
      const subNetwork: Subnet = new Subnet();
      //console.log('keypairsss', Utils.generateKeyPairSecp());
      // console.log(
      //   'BECH32ADDRESS',
      //   validator.publicKey,
      //   Utils.toAddress(Buffer.from(validator.publicKey, 'hex'))
      // );

      subNetwork.meta = JSON.stringify({ name });
      subNetwork.reference = ref;
      subNetwork.status = status;
      subNetwork.account = Address.fromString(account);
      // subNetwork.owner = Address.fromString(account);
      subNetwork.timestamp = Date.now();
      subNetwork.defaultAuthPrivilege = dAuthPriv;
      subNetwork.account = Address.fromString(account);

      const payload: ClientPayload<Subnet> = new ClientPayload();
      payload.data = subNetwork;
      payload.chainId = new ChainId(ML_CHAIN_ID);
      payload.timestamp = Date.now();
      if (update) {
        if (selectedSubnetId == null) {
          notification.error({ message: "No Subnet Selected" });
          throw Error("No Subnet Selected");
          // return;
        }
        payload.eventType = AdminSubnetEventType.UpdateSubnet;
        payload.subnet = selectedSubnetId;
        subNetwork.id = selectedSubnetId;
      } else {
        payload.eventType = AdminSubnetEventType.CreateSubnet;
      }
      payload.data = subNetwork;
      payload.validator = VALIDATOR_PUBLIC_KEY;
      payload.account = Address.fromString(account);
      payload.nonce = 0;

      const pb = payload.encodeBytes();
      console.log("HEXDATA", pb.toString("hex"));
      // payload.signature = await Utils.signMessageEcc(pb, agent.privateKey);
      // const encoded = subNetwork.encodeBytes();
      // console.log("ID::::", { authority, encoded });

      const hash = Utils.keccak256Hash(pb).toString("base64");
      const message = JSON.stringify({
        entity: `Subnet`,
        network: ML_CHAIN_ID,
        identifier: `${subNetwork.reference}`,
        hash: `${hash}`,
      }).replace(/\\s+/g, "");
      console.log("SUBNETSIGNATURE", message);
      let signatureResp: any;
      if (connectedWallet == "keplr") {
        signatureResp = await window.keplr.signArbitrary(
          chainIds[connectedWallet],
          account,
          message
        );
        subNetwork.signatureData = new SignatureData(
          signatureResp.pub_key.type as any,
          signatureResp.pub_key.value,
          signatureResp.signature
        );
      } else {
        // const msgHash = Utils.keccak256Hash(Buffer.from(message));
        signatureResp = await signEth(message, account);

        subNetwork.signatureData = new SignatureData(
          "eth",
          signatureResp.variables.account,
          signatureResp.data ?? ""
        );
      }

      if (!signatureResp) {
        setLoaders((old) => ({ ...old, createSubnet: true }));
        return;
      }
      payload.data = subNetwork;
      console.log("Payload", JSON.stringify(payload.asPayload()));

      const client = new Client(new RESTProvider(NODE_HTTP));
      const resp: any = await client.createSubnet(payload);

      const event = resp?.data?.event;
      console.log("Subnet", "resp", resp, "event", event?.id, event?.t);
      client.resolveEvent({ type: event?.t, id: event?.id }).then((e) => {
        setToggleGroup4((old) => !old);
      });
    } catch (e: any) {
      console.log("Subnet error", e.error);
      if (e.error && String(e.error).includes("UserRejectedRequestError")) {
        setLoaders((old) => ({ ...old, createSubnet: false }));
        return;
      }
      notification.error({
        message: String(e?.response?.data?.error ?? e.message),
      });
    }
    setLoaders((old) => ({ ...old, createSubnet: false }));
  };

  const getAccountSubnets = async (params: Record<string, unknown>) => {
    if (loaders["getAccountSubnets"]) return;
    setLoaders((old) => ({ ...old, getAccountSubnets: true }));
    try {
      const client = new Client(new RESTProvider(NODE_HTTP));
      const respond: SubnetListModel = (await client.getSubnets(
        params
      )) as unknown as SubnetListModel;
      if ((respond as any)?.error) {
        notification.error({ message: (respond as any)?.error + "" });
      }
      setSubnetListList(respond);
      // console.log("getAccountSubnets::::", respond);
    } catch (error) {}
    setLoaders((old) => ({ ...old, getAccountSubnets: false }));
  };

  const getBlockStats = async (params: Record<string, unknown>) => {
    if (loaders["getBlockStats"]) return;
    setLoaders((old) => ({ ...old, getBlockStats: true }));
    try {
      const client = new Client(new RESTProvider(NODE_HTTP));
      const respond: BlockStatsListModel = (await client.getBlockStats(
        params
      )) as unknown as BlockStatsListModel;
      if ((respond as any)?.error) {
        notification.error({ message: (respond as any)?.error + "" });
      }
      setBlockStatsList(respond);
      // console.log("getBlockStats::::", respond);
    } catch (error) {}
    setLoaders((old) => ({ ...old, getBlockStats: false }));
  };

  const getMainStats = async (params: Record<string, unknown>) => {
    if (loaders["getMainStats"]) return;
    setLoaders((old) => ({ ...old, getMainStats: true }));
    try {
      const client = new Client(new RESTProvider(NODE_HTTP));
      const respond: MainStatsModel = (await client.getMainStats(
        params
      )) as unknown as MainStatsModel;
      if ((respond as any)?.error) {
        notification.error({ message: (respond as any)?.error + "" });
      }
      setMainStatsData(respond);
      // console.log("getMainStats::::", respond);
    } catch (error) {}
    setLoaders((old) => ({ ...old, getMainStats: false }));
  };

  const getTopicMessages = async (
    id: string,
    params: Record<string, unknown>
  ) => {
    if (loaders["getTopicMessages"]) return;
    setLoaders((old) => ({ ...old, getTopicMessages: true }));
    try {
      const client = new Client(new RESTProvider(NODE_HTTP));
      const respond: MessageListModel = (await client.getTopicMessages({
        id,
        params,
      })) as unknown as MessageListModel;
      if ((respond as any)?.error) {
        notification.error({ message: (respond as any)?.error + "" });
      }
      setMessagesList(respond);
      // console.log("getTopicMessages::::", respond);
    } catch (error) {}
    setLoaders((old) => ({ ...old, getTopicMessages: false }));
  };

  return (
    <WalletContext.Provider
      value={{
        initialLoading: false,
        loaders,
        initializeKeplr,
        intializeMetamask,
        intializeWagmi,
        // authorizeAgent,
        generateAgent,
        updateAgents,
        generateLocalPrivKeys,
        createTopic,
        setSelectedAgent,
        setCombinedAgents,
        setSelectedMessagesTopicId,
        setSelectedSubnetId,

        // subcribeToTopic,
        sendMessage,
        createSubnet,
        setToggleGroupStats,
        setPointToggleGroup,
        getTopicSubscribers,
        getRecordTopicV2,
        disconnectKeplr,
        walletAccounts,
        loadingWalletConnections,
        walletConnectionState,
        connectedWallet,
        selectedSubnetId,
        selectedSubnet,
        agents: (agents ?? []).filter(
          (agt) => selectedSubnetId == agt.subnetId
        ),
        combinedAgents,
        topicList,
        blockStatsList,
        mainStatsData,
        accountTopicList,
        authenticationList,
        subnetListModelList,
        selectedAgent,
        selectedMessagesTopicId,
        messagesList,
        pointsList,
        pointsCategoryList,
        leaderboardPointsList,
        pointsDetail,
        subscriberTopicList,
        recordTopicList,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const MetaWrapper = ({ children }: { children: ReactNode }) => {
  if (typeof window !== "undefined") {
    return (
      <MetaMaskProvider
        debug={false}
        sdkOptions={{
          dappMetadata: {
            name: "Example React Dapp",
            url: window.location.href,
          },
          // Other options
        }}
      >
        {children}
      </MetaMaskProvider>
    );
  }
  return <>{children}</>;
};

export const WagmiWrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient();

  //  const web3ModalConfig = defaultWagmiConfig({
  //     metadata,
  //     chains: chains,
  //     projectId: wagmiProjectId,
  //     ssr: true,
  //     storage: createStorage({
  //       storage: cookieStorage,
  //     }),
  //   });

  // 3. Create modal
  createWeb3Modal({
    metadata,
    wagmiConfig: wagmiConfig,
    projectId: wagmiProjectId,
    // enableAnalytics: true, // Optional - defaults to your Cloud configuration
    // enableOnramp: true, // Optional - false as default
  });
  return (
    <>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
};
