export const INVITE_TOKEN_KEY = "fp_invite_token";

export function getStoredInviteToken() {
  try {
    return sessionStorage.getItem(INVITE_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function setStoredInviteToken(token) {
  try {
    if (token) sessionStorage.setItem(INVITE_TOKEN_KEY, token);
    else sessionStorage.removeItem(INVITE_TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function clearStoredInviteToken() {
  setStoredInviteToken("");
}
