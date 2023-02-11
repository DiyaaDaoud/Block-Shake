const STORAGE_KEY = "LH_STORAGE_KEY";

// 1. read the access token from local storage
export function readAccessToken() {
  if (typeof window === "undefined") return null;
  const ls = window.localStorage;
  if (!ls) throw new Error("Local Storage id not found 😆");
  const data = ls.getItem(STORAGE_KEY);
  if (!data) return null;
  // console.log("got the data from local storage!");
  return JSON.parse(data) as {
    accessToken: string;
    refreshToken: string;
    exp: number;
  };
}
export function deleteAccessToken() {
  if (typeof window === "undefined") return null;
  const ls = window.localStorage;
  if (!ls) return;
  ls.removeItem(STORAGE_KEY);
}
// 2. store the access token at the local storage
export function setAccessToken(accessToken: string, refreshToken: string) {
  const { exp } = parseJwt(accessToken);
  const ls = window.localStorage;
  if (!ls) throw new Error("Local Storage id not found 😆");
  ls.setItem(STORAGE_KEY, JSON.stringify({ accessToken, refreshToken, exp }));
}

// 3. parse the json web token that comes back and extract the expiration date.
export function parseJwt(token: string) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload); // will return {id, role, iat, exp}
}

export function isTokenExpired(exp: number) {
  if (!exp) {
    // console.log("inside isTokenExpired: did not get exp date!");
    return true;
  }
  if (Date.now() < exp * 1000) {
    // console.log("isTokenExpired: need to refresh");
    return true;
  }
  return false;
}
