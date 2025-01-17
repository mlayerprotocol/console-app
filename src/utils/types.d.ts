interface AddressData {
  privateKey: string;
  publicKey: string;
  address: string;
  subnetId?: string;
  authData?: AuthenticationData;
}

interface AuthenticationData {
  id: string;
  agt: string;
  acct: string;
  gr: string;
  privi: number;
  topIds: string;
  ts: number;
  du: number;
  sigD: SigD;
  h: string;
  eH: string;
  snet?: string;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: null;
}
