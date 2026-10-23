import Link from "next/link";

import { getCurrentUser } from "@/lib/session";
import { LogoutButton } from "./logout-button";

export async function AccountNavigation() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link
        href="/login"
        className="hover:text-zinc-950"
      >
        Sign in
      </Link>
    );
  }

  if (user.role === "ADMIN") {
    return (
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="font-medium hover:text-zinc-950"
        >
          Dashboard
        </Link>

        <span className="text-zinc-500">
          Hi, {user.firstName}
        </span>

        <LogoutButton />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/account"
        className="font-medium hover:text-zinc-950"
      >
        My Account
      </Link>

      <span className="text-zinc-500">
        Hi, {user.firstName}
      </span>

      <LogoutButton />
    </div>
  );
}
