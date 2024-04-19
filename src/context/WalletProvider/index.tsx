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
import {
  CONNECTED_WALLET_STORAGE_KEY,
  KEYPAIR_STORAGE_KEY,
  LOCAL_PRIVKEY_STORAGE_KEY,
  NODE_HTTP,
  SELECTED_AGENT_STORAGE_KEY,
  Storage,
  VALIDATOR_PUBLIC_KEY,
  WALLET_ACCOUNTS_STORAGE_KEY,
} from "@/utils";
import { Utils, Client, Entities } from "@mlayerprotocol/core";
import { notification } from "antd";
import { RESTProvider } from "@mlayerprotocol/core/src";
import { TopicListModel } from "@/model/topic";
import { AuthenticationListModel } from "@/model/authentications/list";
import { Address } from "@mlayerprotocol/core/src/entities";
import { BlockStatsListModel } from "@/model/block-stats";
import { MessageListModel } from "@/model/message/list";
import { MainStatsModel } from "@/model/main-stats/data";

// import { Authorization } from "@mlayerprotocol/core/src/entities";
// const { Authorization } = Entities;

interface WalletContextValues {
  initialLoading: boolean;
  initializeKeplr?: () => Promise<void>;
  intializeMetamask?: () => Promise<void>;
  generateAgent?: (asNew?: boolean) => Promise<AddressData | undefined>;
  updateAgents?: (newKps: AddressData[]) => Promise<void>;
  generateLocalPrivKeys?: (
    asNew?: boolean,
    address?: string,
    privateKey?: string
  ) => Promise<void>;
  walletAccounts: Record<string, string[]>;
  loadingWalletConnections: Record<string, boolean>;
  walletConnectionState: Record<string, boolean>;
  connectedWallet?: string;
  selectedAgent?: string;
  selectedMessagesTopicId?: string;

  agents: AddressData[];
  combinedAgents: AddressData[];
  loaders: Record<string, boolean>;
  topicList?: TopicListModel;
  blockStatsList?: BlockStatsListModel;
  mainStatsData?: MainStatsModel;
  messagesList?: MessageListModel;
  accountTopicList?: TopicListModel;
  authenticationList?: AuthenticationListModel;
  authorizeAgent?: (
    agent: AddressData,
    days: number,
    privilege: 0 | 1 | 2 | 3
  ) => Promise<void>;
  createTopic?: (
    agent: AddressData,
    handle: string,
    name: string,
    description: string,

    reference: string,
    isPublic: boolean,
    options?: {
      id?: string;
      loaderKey?: string;
      isUpdate?: boolean;
    }
  ) => Promise<void>;
  setSelectedAgent?: Dispatch<SetStateAction<string | undefined>>;
  setCombinedAgents?: Dispatch<SetStateAction<AddressData[]>>;
  subcribeToTopic?: (agent: AddressData, topicId: string) => Promise<void>;
  sendMessage?: (
    messageString: string,
    agent: AddressData,
    topicId: string
  ) => Promise<void>;
  setSelectedMessagesTopicId?: Dispatch<SetStateAction<string | undefined>>;
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
});

export const WalletContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [walletAccounts, setWalletAccounts] = useState<
    Record<string, string[]>
  >({});
  const [loadingWalletConnections, setLoadingWalletConnections] = useState<
    Record<string, boolean>
  >({});
  const [walletConnectionState, setWalletConnectionState] = useState<
    Record<string, boolean>
  >({});
  const [connectedWallet, setConnectedWallet] = useState<string>();
  const [toggleGroup1, setToggleGroup1] = useState<boolean>(false);
  const [toggleGroup2, setToggleGroup2] = useState<boolean>(false);
  const [toggleGroup3, setToggleGroup3] = useState<boolean>(false);
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
  const [accountTopicList, setAccountTopicList] = useState<TopicListModel>();
  const [blockStatsList, setBlockStatsList] = useState<BlockStatsListModel>();
  const [mainStatsData, setMainStatsData] = useState<MainStatsModel>();
  const [messagesList, setMessagesList] = useState<MessageListModel>();
  const [authenticationList, setAuthenticationList] =
    useState<AuthenticationListModel>();

  const connectedStorage = useMemo(
    () => new Storage(CONNECTED_WALLET_STORAGE_KEY),
    []
  );
  const wallectAccountsStorage = useMemo(
    () => new Storage(WALLET_ACCOUNTS_STORAGE_KEY),
    []
  );

  const selecteAgentStorage = useMemo(
    () => new Storage(SELECTED_AGENT_STORAGE_KEY),
    []
  );

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
      // console.log({ accounts });

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
    }
  };
  const intializeMetamask = async () => {
    try {
      setLoadingWalletConnections((old) => {
        return { ...old, metamask: true };
      });
      const accounts: any = await sdk?.connect();
      console.log({ e: "intializeMetamask", chainId, connected, accounts });

      setWalletAccounts((old) => {
        return { ...old, metamask: accounts };
      });
      setConnectedWallet("metamask");
    } catch (err) {
      console.warn("failed to connect..", err);
    }
    setLoadingWalletConnections((old) => {
      return { ...old, metamask: false };
    });
  };

  const disconnectMetamask = () => {
    if (sdk) {
      sdk.terminate();
    }
  };

  useEffect(() => {
    if (!topicList) {
      getTopics();
    }

    if (agents.length > 0) return;
    generateAgent(true);
    generateLocalPrivKeys(true);
  }, []);
  useEffect(() => {
    initializeOldState();
    getBlockStats({});
    getMainStats({});
  }, []);

  useEffect(() => {
    getTopicMessages(selectedMessagesTopicId ?? "", {});
  }, [selectedMessagesTopicId, toggleGroup3]);

  useEffect(() => {
    if (connectedWallet) connectedStorage?.set(connectedWallet);
    if (Object.keys(walletAccounts).length > 0)
      wallectAccountsStorage?.set(walletAccounts);
    if (selectedAgent) selecteAgentStorage?.set(selectedAgent);
    console.log({ connectedWallet, walletAccounts, selectedAgent });
  }, [connectedWallet, selectedAgent, walletAccounts]);

  useEffect(() => {
    if (!connectedWallet) return;
    if (Object.keys(walletAccounts).length == 0) return;
    getAuthorizations({
      params: { acct: `did:${walletAccounts[connectedWallet]?.[0]}` },
    });
  }, [connectedWallet, walletAccounts, toggleGroup1]);

  useEffect(() => {
    if (!connectedWallet) return;
    if (Object.keys(walletAccounts).length == 0) return;

    getAccountSubscriptions({
      params: { acct: `did:${walletAccounts[connectedWallet]?.[0]}` },
    });
  }, [connectedWallet, walletAccounts, toggleGroup2]);

  useEffect(() => {
    const serverAgents: AddressData[] = [];
    const localAgents: AddressData[] = [...agents];
    (authenticationList?.data ?? []).forEach((authEl) => {
      const idx: number = localAgents.findIndex(
        (agt) => agt.address == authEl.agt
      );
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
    setCombinedAgents([...localAgents, ...serverAgents]);
  }, [agents, authenticationList]);

  const ganerateAuthorizationMessage = async (
    validatorPublicKey: string,
    account: AddressData,
    agent: AddressData,
    days: number = 30,
    privilege: 0 | 1 | 2 | 3 = 3
  ) => {
    const authority: Entities.Authorization = new Entities.Authorization();
    // console.log("keypairsss", Utils.generateKeyPairSecp());
    // console.log(
    //   "BECH32ADDRESS",
    //   validatorPublicKey,
    //   Utils.toAddress(Buffer.from(validatorPublicKey, "hex"))
    // );
    authority.account = Entities.Address.fromString(account.publicKey);
    authority.agent = agent.address;
    authority.grantor = Entities.Address.fromString(account.publicKey);
    authority.timestamp = Date.now();
    authority.topicIds = "*";
    authority.privilege = privilege;
    authority.duration = days * 24 * 60 * 60 * 1000; // 30 days
    // console.log({ authority });
    const encoded = authority.encodeBytes();
    // console.log("ID::::", { authority, encoded });

    const hash = Utils.sha256Hash(encoded).toString("base64");
    console.log("Hash string", `Approve ${authority.agent} for tml: ${hash}`);
    return {
      message: `Approve ${authority.agent} for ml: ${hash}`,
      authority,
    };
  };

  const connectToClient = async (
    authSig: string,
    type: string,
    authority: Entities.Authorization,
    validatorPublicKey: string,
    account: AddressData,
    agent: AddressData
  ) => {
    authority.signatureData = new Entities.SignatureData(
      type as any,
      account.publicKey,
      authSig
    );

    // console.log("Grant", authority.asPayload());

    const payload: Entities.ClientPayload<Entities.Authorization> =
      new Entities.ClientPayload();
    payload.data = authority;
    payload.timestamp = Date.now();
    payload.eventType = Entities.AuthorizeEventType.AuthorizeEvent;
    payload.validator = validatorPublicKey;
    const pb = payload.encodeBytes();
    payload.signature = Utils.signMessageEcc(pb, agent.privateKey);
    // console.log({ p: payload.asPayload() });
    // console.log("Payload", JSON.stringify(payload.asPayload()));

    const client = new Client(new RESTProvider(NODE_HTTP));
    const auth = await client.authorize(payload);
    if (auth.error) {
      notification.error({ message: auth.error + "" });
    }
    // console.log("AUTHORIZE", auth, "rr", auth.error);
  };

  const authorizeAgent = async (
    agent: AddressData,
    days: number = 30,
    privilege: 0 | 1 | 2 | 3 = 3
  ) => {
    if (connectedWallet == null) {
      notification.error({ message: "No wallet connected" });
      return;
    }
    const account = walletAccounts[connectedWallet][0];
    if (account == null) {
      notification.error({ message: "No account found" });
      return;
    }
    setLoaders((old) => ({ ...old, authorizeAgent: true }));
    ganerateAuthorizationMessage(
      String(VALIDATOR_PUBLIC_KEY),
      {
        address: account,
        publicKey: account,
        privateKey: "",
      },
      agent,
      days,
      privilege
    )
      .then(async (messageObj) => {
        console.log({ messageObj });
        if (!window.keplr) {
          notification.error({ message: "Please install keplr extension" });
          return;
        }
        
        const signature = await window.keplr.signArbitrary(
          chainIds[connectedWallet],
          account,
          messageObj.message
        );
        connectToClient(
          signature.signature,
          signature.pub_key.type,
          messageObj.authority,
          VALIDATOR_PUBLIC_KEY,
          {
            address: account,
            publicKey: signature.pub_key.value,
            privateKey: "",
          },
          agent
        ).finally(() => {
          setLoaders((old) => ({ ...old, authorizeAgent: false }));
          setToggleGroup1((old) => !old);
        });
      })
      .catch((r) => {
        console.log({r})
        setLoaders((old) => ({ ...old, authorizeAgent: false }));
      });
  };

  const generateAgent = async (asNew?: boolean) => {
    if (typeof window !== "undefined") {
      const storage = new Storage(KEYPAIR_STORAGE_KEY);
      // console.log({ KEYPAIR_STORAGE_KEY, storage: storage.get() });

      if (asNew && storage.get()) {
        setAgents(storage.get());
        return;
      }
      const kp = Utils.generateKeyPairEcc();
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

      if (selecteAgentStorage.get()) {
        setSelectedAgent(selecteAgentStorage.get());
      }
      // console.log({
      //   CONNECTED_WALLET_STORAGE_KEY,
      //   WALLET_ACCOUNTS_STORAGE_KEY,
      //   storage: connectedStorage,
      // });
    }
  };

  const createTopic = async (
    agent: AddressData,
    handle: string,
    name: string,
    description: string,

    reference: string,
    isPublic: boolean,
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
    const { loaderKey, isUpdate = false, id } = options ?? {};
    setLoaders((old) => ({ ...old, [loaderKey ?? "createTopic"]: true }));
    try {
      const topic: Entities.Topic = new Entities.Topic();
      //console.log('keypairsss', Utils.generateKeyPairSecp());
      // console.log(
      //   'BECH32ADDRESS',
      //   validator.publicKey,
      //   Utils.toAddress(Buffer.from(validator.publicKey, 'hex'))
      // );
      topic.handle = handle;
      topic.description = description;

      topic.name = name;
      topic.reference = reference;
      topic.isPublic = isPublic;
      topic.id = id ?? "";

      const payload: Entities.ClientPayload<Entities.Topic> =
        new Entities.ClientPayload();
      payload.data = topic;
      payload.timestamp = Date.now();
      payload.eventType = isUpdate
        ? Entities.AdminTopicEventType.UpdateTopic
        : Entities.AdminTopicEventType.CreateTopic;
      payload.validator = VALIDATOR_PUBLIC_KEY;
      payload.account = Entities.Address.fromString(account);
      payload.nonce = 0;
      const pb = payload.encodeBytes();
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
        getTopics();
        setToggleGroup2((old) => !old);
      });
    } catch (e: any) {
      console.log("AUTHORIZE error", e);
      notification.error({ message: e?.response?.data?.error + "" });
    }
    setLoaders((old) => ({ ...old, [loaderKey ?? "createTopic"]: false }));
  };

  const getTopics = async () => {
    if (loaders["getTopic"]) return;
    setLoaders((old) => ({ ...old, getTopic: true }));
    try {
      const client = new Client(new RESTProvider(NODE_HTTP));
      const respond: TopicListModel =
        (await client.getTopic()) as unknown as TopicListModel;
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
      console.log("getAuthorizations::::", respond);
    } catch (error) {}
    setLoaders((old) => ({ ...old, getAuthorizations: false }));
  };

  const subcribeToTopic = async (agent: AddressData, topicId: string) => {
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
      const subscribe: Entities.Subscription = new Entities.Subscription();
      //console.log('keypairsss', Utils.generateKeyPairSecp());
      // console.log(
      //   'BECH32ADDRESS',
      //   validator.publicKey,
      //   Utils.toAddress(Buffer.from(validator.publicKey, 'hex'))
      // );
      // subscribe.status = 1;
      subscribe.topic = topicId;
      subscribe.account = Address.fromString(account);
      //   subscribe.agent = "Bitcoin world";
      //   subscribe.reference = "898989";

      const payload: Entities.ClientPayload<Entities.Subscription> =
        new Entities.ClientPayload();
      payload.data = subscribe;
      payload.timestamp = Date.now();
      payload.eventType = Entities.MemberTopicEventType.JoinEvent;
      payload.validator = VALIDATOR_PUBLIC_KEY;
      payload.account = Address.fromString(account);
      const pb = payload.encodeBytes();
      console.log("🚀 ~ main ~ pb:", pb.toString("hex"));
      payload.signature = await Utils.signMessageEcc(pb, agent.privateKey);
      console.log("Payload", JSON.stringify(payload.asPayload()));

      const client = new Client(new RESTProvider(NODE_HTTP));
      const auth: any = await client.createSubscription(payload);

      const event = auth?.data;
      console.log("AUTHORIZE", "auth", auth, "event", event?.id, event?.t);
      client.resolveEvent({ type: event?.t, id: event?.id }).then((e) => {
        getTopics();
        setToggleGroup2((old) => !old);
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
      const respond: TopicListModel = (await client.getAccountSubscriptions(
        params
      )) as unknown as TopicListModel;
      if ((respond as any)?.error) {
        notification.error({ message: (respond as any)?.error + "" });
      }
      setAccountTopicList(respond);
      // console.log("getAccountSubscriptions::::", respond);
    } catch (error) {}
    setLoaders((old) => ({ ...old, getAccountSubscriptions: false }));
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
    setLoaders((old) => ({ ...old, sendMessage: true }));
    try {
      const message: Entities.Message = new Entities.Message();
      const messageAction = new Entities.MessageAction();
      const messageAttachment = new Entities.MessageAttachment();
      const messageActions = [];
      const messagettachments = [];

      messageAction.contract = "";
      messageAction.abi = "";
      messageAction.action = "";
      messageAction.parameters = [""];

      messageActions.push(messageAction);

      messageAttachment.cid = "";
      messageAttachment.hash = "";

      messagettachments.push(messageAttachment);

      message.topicId = topicId;
      message.sender = Address.fromString(account);
      message.data = Buffer.from(messageString);
      message.attachments = messagettachments.map((item) => item.asPayload());
      message.actions = messageActions.map((item) => item.asPayload());

      const payload: Entities.ClientPayload<Entities.Message> =
        new Entities.ClientPayload();
      payload.data = message;
      payload.timestamp = Date.now();
      payload.eventType = Entities.MemberMessageEventType.SendMessageEvent;
      payload.validator = VALIDATOR_PUBLIC_KEY;
      payload.account = Address.fromString(account);
      payload.nonce = 0;
      const pb = payload.encodeBytes();
      console.log("HEXDATA", pb.toString("hex"));
      payload.signature = await Utils.signMessageEcc(pb, agent.privateKey);
      console.log("Payload", JSON.stringify(payload.asPayload()));

      const client = new Client(new RESTProvider(NODE_HTTP));
      const resp: any = await client.createMessage(payload);

      const event = resp?.data;
      console.log("AUTHORIZE", "resp", resp, "event", event?.id, event?.t);
      client.resolveEvent({ type: event?.t, id: event?.id }).then((e) => {
        setToggleGroup3((old) => !old);
      });
    } catch (e: any) {
      console.log("AUTHORIZE error", e);
      notification.error({ message: e?.response?.data?.error + "" });
    }
    setLoaders((old) => ({ ...old, sendMessage: false }));
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
        authorizeAgent,
        generateAgent,
        updateAgents,
        generateLocalPrivKeys,
        createTopic,
        setSelectedAgent,
        setCombinedAgents,
        setSelectedMessagesTopicId,
        subcribeToTopic,
        sendMessage,
        walletAccounts,
        loadingWalletConnections,
        walletConnectionState,
        connectedWallet,
        agents,
        combinedAgents,
        topicList,
        blockStatsList,
        mainStatsData,
        accountTopicList,
        authenticationList,
        selectedAgent,
        selectedMessagesTopicId,
        messagesList,
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
