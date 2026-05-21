import { supabase } from "./supabase.js";

export function getAuthRedirectUrl() {
  return `${window.location.origin}/`;
}

export async function signInWithProvider(provider) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: getAuthRedirectUrl()
    }
  });
  if (error) throw error;
}
