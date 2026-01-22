import { createAuthClient } from "better-auth/svelte";
import { jwtClient } from "better-auth/client/plugins";
import { PUBLIC_APP_URL } from "$env/static/public";

// Create the auth client for browser-side auth operations
export const authClient = createAuthClient({
  // The base URL of the auth server (SvelteKit app)
  baseURL: PUBLIC_APP_URL,
  plugins: [
    // JWT plugin allows us to get tokens to send to the DO/Worker
    jwtClient(),
  ],
});

// Re-export commonly used functions for convenience
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  // JWT token retrieval - use this to get a token for the DO/Worker
  token,
} = authClient;

// Helper to get auth headers for API requests to the DO/Worker
export async function getAuthHeaders(): Promise<HeadersInit> {
  const { data, error } = await authClient.token();
  if (error || !data?.token) {
    return {};
  }
  return {
    Authorization: `Bearer ${data.token}`,
  };
}
