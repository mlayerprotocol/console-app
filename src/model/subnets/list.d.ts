export interface SubnetListModel {
  data: SubnetData[];
  _meta: Meta;
}

export interface Meta {
  version: string;
}

export interface SubnetData {
  id: string;
  n: string;
  ref: string;
  st: number;
  acct: string;
  agt: string;
  e: E;
  h: string;
  dAuthPriv: Entities.AuthorizationPrivilege;
  meta: any;
  balance?: number | BigInt;
  CreatedAt: Date;
  UpdatedAt: Date;
  DeletedAt: null;
}

export interface E {
  mod: string;
  h: string;
  val: string;
}

// class MetaWrapper {
//   meta: string;
//   constructor(meta: string) {
//     this.meta = meta;
//   }
//   public function toJson(): Record<string, any> {
//     return JSON.parse(this.meta);
//   }
// }
