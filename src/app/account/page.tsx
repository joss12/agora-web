import { redirect } from "next/navigation";

import { AccountDashboard } from "@/components/account/account-dashboard";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "My Account | Agora",
  description:
    "Manage your orders and deliveries.",
};

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  return <AccountDashboard />;
}
