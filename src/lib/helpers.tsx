// 1. sign the typed data with omitted __typename using omit-deep

import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { EIP712Domain } from "@thirdweb-dev/sdk/dist/declarations/src/evm/common/sign";
import { ethers } from "ethers";
import omitDeep from "omit-deep";
import {
  DefaultProfileQuery,
  NotificationsQuery,
  useHasTxHashBeenIndexedQuery,
} from "../graphql/generated";

// 2. split the signed data to get {v,r,s}

export function omitTypename(object: any) {
  return omitDeep(object, ["__typename"]);
}

export async function signTypedDatawithOmittedTypename(
  sdk: ThirdwebSDK,
  domain: EIP712Domain,
  types: Record<string, any>,
  values: Record<string, any>
) {
  return await sdk.wallet.signTypedData(
    omitTypename(domain) as EIP712Domain,
    omitTypename(types) as Record<string, any>,
    omitTypename(values) as Record<string, any>
  );
}

export function splitSignature(signature: string) {
  return ethers.utils.splitSignature(signature);
}

export function storeProfileQuery(
  PQ: DefaultProfileQuery,
  address: string | undefined
) {
  if (!address) return;
  const ls = window.localStorage;
  if (!ls) throw new Error("Local Storage id not found 😆");
  ls.setItem(`DefaultProfileQuery_${address}`, JSON.stringify(PQ));
}
export function readProfileQuery(address: string | undefined) {
  if (!address) return undefined;
  const ls = window.localStorage;
  if (!ls) throw new Error("Local Storage id not found 😆");
  const data = ls.getItem(`DefaultProfileQuery_${address}`);
  if (!data) return undefined;
  // console.log("got the data from local storage!");
  return JSON.parse(data) as DefaultProfileQuery;
}
export function storeNotifications(
  notifications: NotificationsQuery,
  address: string | undefined
) {
  if (!address) return;
  const ls = window.localStorage;
  if (!ls) throw new Error("Local Storage id not found 😆");
  ls.setItem(`ProfilNotifications_${address}`, JSON.stringify(notifications));
}
export function readNotifications(address: string | undefined) {
  if (!address) return undefined;
  const ls = window.localStorage;
  if (!ls) throw new Error("Local Storage id not found 😆");
  const data = ls.getItem(`ProfilNotifications_${address}`);
  if (!data) return undefined;
  // console.log("got the data from local storage!");
  return JSON.parse(data) as NotificationsQuery;
}
export function storeSeenNotifications(
  num: number,
  address: string | undefined
) {
  if (!address) return;
  const ls = window.localStorage;
  if (!ls) throw new Error("Local Storage id not found 😆");
  ls.setItem(`SeenNotifications_${address}`, num.toString());
}
export function readSeenNotifications(address: string | undefined) {
  if (!address) return undefined;
  const ls = window.localStorage;
  if (!ls) throw new Error("Local Storage id not found 😆");
  const data = ls.getItem(`SeenNotifications_${address}`);
  if (!data) return undefined;
  // console.log("got the data from local storage!");
  return parseInt(data);
}
