export const INVITE_TOKEN_KEY = "fp_invite_token";

function storage() {
  try {
    // localStorage: mobil Safari / sekme kapanınca sessionStorage kaybolabiliyor
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getStoredInviteToken() {
  try {
    const ls = storage();
    const fromLs = ls?.getItem(INVITE_TOKEN_KEY) || "";
    if (fromLs) return fromLs;
    // Eski oturumlardan taşı
    const fromSs = sessionStorage.getItem(INVITE_TOKEN_KEY) || "";
    if (fromSs && ls) {
      ls.setItem(INVITE_TOKEN_KEY, fromSs);
      sessionStorage.removeItem(INVITE_TOKEN_KEY);
    }
    return fromSs;
  } catch {
    return "";
  }
}

export function setStoredInviteToken(token) {
  try {
    const ls = storage();
    if (!ls) return;
    if (token) ls.setItem(INVITE_TOKEN_KEY, token);
    else ls.removeItem(INVITE_TOKEN_KEY);
    try {
      sessionStorage.removeItem(INVITE_TOKEN_KEY);
    } catch {
      /* ignore */
    }
  } catch {
    /* ignore */
  }
}

export function clearStoredInviteToken() {
  setStoredInviteToken("");
}
