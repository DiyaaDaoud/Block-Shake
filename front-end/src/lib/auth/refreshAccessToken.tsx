import {
  RefreshDocument,
  RefreshMutation,
  RefreshMutationVariables,
} from "@/src/graphql/generated";
import { readAccessToken, setAccessToken } from "./helpers";

export default async function refreshAccessToken() {
  let data = readAccessToken();
  if (!data) return;
  const refreshToken = data.refreshToken;
  if (!refreshToken) {
    console.log("did not get a refresh token!");
    return null;
  }
  async function fetchData<TData, TVariables>(
    query: string,
    variables?: TVariables,
    options?: RequestInit["headers"]
  ): Promise<TData> {
    const res = await fetch("https://api-mumbai.lens.dev/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options,
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const json = await res.json();

    if (json.errors) {
      const { message } = json.errors[0] || {};
      throw new Error(message || "Error…");
    }

    return json.data;
  }

  const response = await fetchData<RefreshMutation, RefreshMutationVariables>(
    RefreshDocument,
    {
      request: {
        refreshToken: refreshToken,
      },
    }
  );
  const {
    refresh: { accessToken, refreshToken: newRefreshToken },
  } = response;

  setAccessToken(accessToken, newRefreshToken);

  return accessToken as string;
}
