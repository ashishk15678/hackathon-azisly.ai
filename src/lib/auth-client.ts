import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // baseURL is optional when client and server share the same domain.
  // Uncomment and set if your auth server runs on a different origin:
  // baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

export const { signIn, signOut, signUp, useSession } = authClient;
