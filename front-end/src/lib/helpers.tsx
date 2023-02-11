// 1. sign the typed data with omitted __typename using omit-deep

import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { EIP712Domain } from "@thirdweb-dev/sdk/dist/declarations/src/evm/common/sign";
import { ethers } from "ethers";
import omitDeep from "omit-deep";
import { useHasTxHashBeenIndexedQuery } from "../graphql/generated";

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

export async function pollUntilIndexed(
  input: { txHash: string } | { txId: string }
) {
  while (true) {
    const {
      data: txHashIndexedData,
      isLoading: txHashIndexedLoading,
      isError: txHahIndexedError,
    } = useHasTxHashBeenIndexedQuery(
      {
        request: {
          // @ts-ignore
          txHash: input.txHash ? input.txHash : "",
          // @ts-ignore
          txId: input.txId ? input.txId : "",
        },
      },
      {
        //@ts-ignore
        enabled: !!(input.txHash || input.txId),
      }
    );
    if (
      txHashIndexedData?.hasTxHashBeenIndexed.__typename ==
      "TransactionIndexedResult"
    ) {
      console.log(
        "pool until indexed: indexed",
        txHashIndexedData.hasTxHashBeenIndexed.indexed
      );
      console.log(
        "pool until metadataStatus: metadataStatus",
        txHashIndexedData.hasTxHashBeenIndexed.metadataStatus
      );
      if (txHashIndexedData.hasTxHashBeenIndexed.metadataStatus) {
        if (
          txHashIndexedData.hasTxHashBeenIndexed.metadataStatus.status ==
          "SUCCESS"
        ) {
          return txHashIndexedData.hasTxHashBeenIndexed;
        }
        if (
          txHashIndexedData.hasTxHashBeenIndexed.metadataStatus?.status ==
          "METADATA_VALIDATION_FAILED"
        ) {
          throw new Error(
            txHashIndexedData.hasTxHashBeenIndexed.metadataStatus.status
          );
        }
      } else {
        if (txHashIndexedData.hasTxHashBeenIndexed.indexed) {
          return txHashIndexedData.hasTxHashBeenIndexed;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } else {
      throw new Error(txHashIndexedData?.hasTxHashBeenIndexed.reason);
    }
  }
}
