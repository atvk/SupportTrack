"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Admin from "../../components/Admin";
import { UserData } from "@/src/types/users";

const ADMIN_EMAIL = "steblovskiyanton@gmail.com";

export default function AdminPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.replace("/");
      return;
    }

    try {
      const parsed = JSON.parse(stored) as UserData;
      const isAdmin = parsed.role === "Админ" || parsed.email?.toLowerCase() === ADMIN_EMAIL;
      if (!isAdmin) {
        router.replace(`/users/${parsed.id}`);
        return;
      }
      if (String(parsed.id) !== String(id)) {
        router.replace(`/admin/${parsed.id}`);
        return;
      }

      setUser(parsed);
    } catch {
      localStorage.removeItem("user");
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  return (
    <main className="min-w-[360px] max-w-[1440px] mx-auto w-full p-2 bg-white text-gray-800 dark:bg-gray-800 dark:text-white">
      <Admin user={user} />
    </main>
  );
}
