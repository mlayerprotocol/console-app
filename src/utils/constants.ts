export const THEME_STORAGE_KEY = "@@mlayer-storage/theme";
export const KEYPAIR_STORAGE_KEY = "@@mlayer-storage/keypair-v4";
export const LOCAL_PRIVKEY_STORAGE_KEY = "@@mlayer-storage/local-privkey-v4";
export const CONNECTED_WALLET_STORAGE_KEY = "@@mlayer-storage/connected-wallet";
export const WALLET_ACCOUNTS_STORAGE_KEY = "@@mlayer-storage/wallet-accounts";

export const SELECTED_AGENT_STORAGE_KEY =
  "@@mlayer-storage/selected-agent-account";
export const SELECTED_SUBNET_STORAGE_KEY =
  "@@mlayer-storage/selected-subnet-id";
export const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;
// export const HOST_URL = process.env.NEXT_PUBLIC_API_BASE_URL
export const ML_ADDRESS_PREFIX = `${
  process.env.NEXT_PUBLIC_MLAYER_ADDRESS_PREFIX ?? "mldev"
}`;

export const ML_CHAIN_ID = `${
  process.env.NEXT_PUBLIC_MLAYER_CHAIN_ID ?? "31337"
}`;

export const ML_ACCOUNT_DID_STRING = `${
  process.env.NEXT_PUBLIC_MLAYER_ACCOUNT_DID_STRING ?? "mid"
}`;

export const ML_AGENT_DID_STRING = `${
  process.env.NEXT_PUBLIC_MLAYER_AGETN_DID_STRING ?? "did"
}`;

export const AUTH_URL = "/auth";
export const ACCOUNT_URL = "/account";
export const ACCOUNT_LOGOUT = "/logout";
export const STATUS_URL = "/status";
export const USER_URL = "/users";
export const TRANSACTION_URL = "/transaction";
export const VALIDATOR_PUBLIC_KEY = String(process.env.NEXT_PUBLIC_VALIDATOR);
export const NODE_HTTP = process.env.NEXT_PUBLIC_NODE_HTTP;
export const MIDDLEWARE_HTTP = process.env.NEXT_PUBLIC_MIDDLEWARE_HTTP;
export const SOLIDBASE_HTTP = process.env.NEXT_PUBLIC_SOLIDBASE_HTTP;
export const FOLLOW_DISCORD_HTTP = process.env.NEXT_PUBLIC_FOLLOW_DISCORD_HTTP;
export const FOLLOW_TWITTER_HTTP = process.env.NEXT_PUBLIC_FOLLOW_TWITTER_HTTP;
export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || "Devnet";
export const displayVariants = {
  hidden: { opacity: 0, scale: 0 },
  exit0: { opacity: 0, scale: 0 },
  show: {
    opacity: 1,
    scale: 1,
  },
};

export const formLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export const INFO_LINKS = {
  subnetInfo:
    "https://mlayer.gitbook.io/white-paper/technology#components-of-the-communication-layer",
  agentInfo:
    "https://mlayer.gitbook.io/white-paper/technology#components-of-the-communication-layer",
  topicInfo:
    "https://mlayer.gitbook.io/white-paper/technology#components-of-the-communication-layer",
  airdrop:
    "https://mlayer.gitbook.io/white-paper/technology#components-of-the-communication-layer",
  subscribers:
    "https://mlayer.gitbook.io/white-paper/technology#components-of-the-communication-layer",
};

export const MIDDLEWARE_HTTP_URLS = {
  connect: {
    url: `${MIDDLEWARE_HTTP}/v1/activity/connect-wallet`,
    method: `POST`,
  },
  claim: {
    url: `${MIDDLEWARE_HTTP}/v1/activity/claim`,
    method: `POST`,
  },
  account: {
    url: `${MIDDLEWARE_HTTP}/v1/activity/account`,
    method: `GET`,
  },
  leaderBoard: {
    url: `${MIDDLEWARE_HTTP}/v1/project/leaderboard/points`,
    method: `GET`,
  },
  discord: {
    connect: {
      url: `${SOLIDBASE_HTTP}/v1/activity-point/discord/connect`,
      method: `POST`,
    },
    verify: {
      url: `${SOLIDBASE_HTTP}/v1/activity-point/verify/discord`,
      method: `POST`,
    },
  },
  twitter: {
    connect: {
      url: `${SOLIDBASE_HTTP}/v1/activity-point/twitter/connect`,
      method: `POST`,
    },
    verify: {
      url: `${SOLIDBASE_HTTP}/v1/activity-point/verify/x`,
      method: `POST`,
    },
  },
};

export const ZERO_ADDRESS = "0x0000000000000000000000000000";
