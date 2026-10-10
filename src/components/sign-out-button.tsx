"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Logout02Icon } from "hugeicons-react";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
    >
      <Logout02Icon size={15} />
      Sign out
    </button>
  );
}
