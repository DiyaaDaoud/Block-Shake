import { isTokenExpired, readAccessToken } from "../lib/auth/helpers";
import refreshAccessToken from "../lib/auth/refreshAccessToken";

// what logic are we gonna run each time we send request to the Lens GraphqL server?
export const fetcher = <TData, TVariables>(
  query: string,
  variables?: TVariables,
  options?: RequestInit["headers"]
): (() => Promise<TData>) => {
  async function getAccessToken() {
    const data = readAccessToken();
    if (!data) return null;
    // console.log("data: ", data);
    let accessToken = data.accessToken;
    if (isTokenExpired(data.exp)) {
      // console.log("refreshing!");
      const refreshedAccessToken = await refreshAccessToken();
      // console.log("refreshedAccessToken: ", refreshedAccessToken);
      if (!refreshedAccessToken) return null;
      // console.log("refreshedAccessToken: ", refreshedAccessToken);
      accessToken = refreshedAccessToken;
    }
    return accessToken;
  }

  return async () => {
    const accessToken =
      typeof window !== "undefined" ? await getAccessToken() : null;
    const res = await fetch("https://api-mumbai.lens.dev", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options,
        "x-access-token": accessToken ? accessToken : "", // automatically send authentication when calling lens APIs
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
  };
};
//"Access-Control-Allow-Origin":"*"
