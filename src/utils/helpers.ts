import { notification } from "antd";
import { RcFile } from "antd/es/upload";
import { ethers } from "ethers";

export function randomImageUrl(): string {
  return `https://source.unsplash.com/random?${
    Math.floor(Math.random() * 3) + 1
  }`;
}
export const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

export const shorternAddress: (address: string) => string = (address) => {
  return `${address.substring(0, 4)}***${address?.substring(
    address.length - 4
  )}`;
};

export const generateKeyPairEcc: () => Record<string, string> = () => {
  const wallet = ethers.Wallet.createRandom();

  // Extract the private key, public key, and address
  const privateKey = wallet.privateKey;
  const publicKey = wallet.publicKey;
  const address = wallet.address;

  return { privateKey, publicKey, address };
};

export function waitFor(ms: number, value: any) {
  return new Promise((resolve) => setTimeout(resolve, ms, value));
}

export function currencyFormat(num: number, currency: string = "$") {
  return `${currency}${num
    .toFixed(2)
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")}`;
}

export function metaToObject(value?: string): Record<string, any> | undefined {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch (error) {
    return undefined;
  }
}

export async function makeRequest(
  url: string,
  init?: RequestInit
): Promise<Response | undefined> {
  if (!window.fetch) {
    return undefined;
  }
  try {
    return fetch(url, {
      ...init,
      headers: { ...init?.headers, "Content-Type": "application/json" },
    });
  } catch (error) {
    return undefined;
  }
}

export function uuidToHexString(uuid: string): string {
  return `0x${uuid?.replaceAll("-", "")}`;
}
