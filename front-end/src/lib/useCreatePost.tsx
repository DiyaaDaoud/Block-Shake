import { useMutation } from "@tanstack/react-query";
import { useAddress, useSDK, useStorageUpload } from "@thirdweb-dev/react";
import { splitSignature } from "ethers/lib/utils";
import { v4 } from "uuid";
import {
  LENS_CONTRACT_ABI,
  LENS_CONTRACT_ADDRESS,
} from "../constants/contracts";
import {
  PublicationMainFocus,
  useCreatePostTypedDataMutation,
} from "../graphql/generated";
import useLensUser from "./auth/useLensUser";
import useLogin from "./auth/useLogin";
import { signTypedDatawithOmittedTypename } from "./helpers";
type CreatePostArgs = {
  image: File | string | null;
  title: string;
  description: string;
  content: string;
};
export default function useCreatePost() {
  const sdk = useSDK();
  const { mutateAsync: requestTypedData } = useCreatePostTypedDataMutation();
  const { profileQuery, isSignedInQuery } = useLensUser();
  const { mutateAsync: uploadToIPFS } = useStorageUpload();
  const { mutateAsync: login } = useLogin();
  async function createPost({
    image,
    title,
    description,
    content,
  }: CreatePostArgs) {
    console.log("image: ", image);
    await login();
    let imageToIPFS: string | null;
    console.log("create post: logged in!");
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
            tags: [],
          },
        ],
      })
    )[0];
    console.log("create post: uploaded DATA yo IPFS");
    const typedData = await requestTypedData({
      request: {
        profileId: profileQuery.data?.defaultProfile?.id,
        contentURI: ipfsResult,
        collectModule: {
          freeCollectModule: {
            followerOnly: false,
          },
        },
        referenceModule: {
          followerOnlyReferenceModule: false,
        },
      },
    });
    console.log("create post: REQUESTED TYPED DATA");
    if (!sdk) return;
    const signatureObject = await signTypedDatawithOmittedTypename(
      sdk,
      typedData.createPostTypedData.typedData.domain,
      typedData.createPostTypedData.typedData.types,
      typedData.createPostTypedData.typedData.value
    );
    console.log("create post: SIGNED DATA");
    const { v, r, s } = splitSignature(signatureObject.signature);

    const lensHubContract = await sdk.getContractFromAbi(
      LENS_CONTRACT_ADDRESS,
      LENS_CONTRACT_ABI
    );

    const result = await lensHubContract.call("postWithSig", {
      profileId: typedData.createPostTypedData.typedData.value.profileId,
      contentURI: typedData.createPostTypedData.typedData.value.contentURI,
      collectModule:
        typedData.createPostTypedData.typedData.value.collectModule,
      collectModuleInitData:
        typedData.createPostTypedData.typedData.value.collectModuleInitData,
      referenceModule:
        typedData.createPostTypedData.typedData.value.referenceModule,
      referenceModuleInitData:
        typedData.createPostTypedData.typedData.value.referenceModuleInitData,
      sig: {
        v,
        r,
        s,
        deadline: typedData.createPostTypedData.typedData.value.deadline,
      },
    });
    console.log("create post: CALLED THE CONTRACT");
  }
  return useMutation(createPost);
}
