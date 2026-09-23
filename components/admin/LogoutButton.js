"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="inline-flex h-11 items-center rounded-full px-3 text-sm text-mist transition hover:text-paper sm:px-4"
    >
      Sair
    </button>
  );
}
