import { useMutation } from "@tanstack/react-query";
import { useAddress, useSDK, useStorageUpload } from "@thirdweb-dev/react";
import {
  CollectModules,
  PublicationMainFocus,
  useCreatePostViaDispatcherMutation,
} from "../graphql/generated";
import useLogin from "./auth/useLogin";
import { v4 } from "uuid";
import { readProfileQuery } from "./helpers";
type PostArgs = {
  image: File | string | null;
  title: string;
  description: string;
  content: string;
  followerOnly: boolean;
  collectModule: CollectModules;
  collectFeeValue: string;
  collectLimit: string;
};
export default function useCreatePost() {
  const address = useAddress();
  const { mutateAsync: login } = useLogin();
  const { mutateAsync: uploadToIPFS } = useStorageUpload();
  const sdk = useSDK();
  const { mutateAsync: postViaDispatcher } =
    useCreatePostViaDispatcherMutation();
  const customProfile = readProfileQuery(address);
  async function createPost({
    image,
    title,
    description,
    content,
    followerOnly,
    collectModule,
    collectFeeValue,
    collectLimit,
  }: PostArgs) {
    await login();
    console.log("create post: logged in!");
    let imageToIPFS: string | null;

    if (image != null) {
      imageToIPFS = (await uploadToIPFS({ data: [image] }))[0];
    } else {
      imageToIPFS = null;
    }
    console.log("create post: uploaded image yo IPFS");
    const ipfsResult = (
      await uploadToIPFS({
        data: [
          {
            version: "2.0.0",
            mainContentFocus: PublicationMainFocus.TextOnly,
            metadata_id: v4(),
            description: description,
            locale: "en-US",
            content: content,
            external_url: null,
            image: imageToIPFS,
            imageMimeType: null,
            name: title,
            attributes: [],
          },
        ],
      })
    )[0];
    console.log("create post: uploaded data yo IPFS");

    let inputCollectModule;
    if (collectModule == CollectModules.FreeCollectModule) {
      inputCollectModule = {
        freeCollectModule: { followerOnly: followerOnly },
      };
    } else if (collectModule == CollectModules.FeeCollectModule) {
      inputCollectModule = {
        feeCollectModule: {
          amount: {
            currency: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
            value: collectFeeValue,
          },
          recipient: address,
          referralFee: 10,
          followerOnly: followerOnly,
        },
      };
    } else if (collectModule == CollectModules.LimitedFeeCollectModule) {
      inputCollectModule = {
        limitedFeeCollectModule: {
          amount: {
            currency: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
            value: collectFeeValue,
          },
          collectLimit: collectLimit,
          recipient: address,
          referralFee: 10,
          followerOnly: followerOnly,
        },
      };
    } else {
      inputCollectModule = { revertCollectModule: true };
    }
    console.log("create post: got collect module");

    const dispatcherResult = await postViaDispatcher({
      request: {
        collectModule: inputCollectModule,
        contentURI: ipfsResult,
        profileId: customProfile?.defaultProfile?.id,
        referenceModule: {
          followerOnlyReferenceModule: false,
        },
      },
    });
    console.log("create post: used Dispatcher");
  }
  // if (!customProfile?.defaultProfile?.id) return;
  // if (!customProfile.defaultProfile.dispatcher?.canUseRelay) return;
  return useMutation(createPost);
}
