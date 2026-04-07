"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Admin from "../../components/Admin";
import Director from "../../components/Director";
import Employee from "../../components/Employee";
import Specialist from "../../components/Specialist";
import { UserData } from "@/src/types/users";

export default function UserPage() {
  const { id } = useParams();
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
      const parsed = JSON.parse(stored);
      if (String(parsed.id) !== String(id)) {
        router.replace("/");
        return;
      }
      setUser(parsed);
    } catch {
      localStorage.removeItem("user");
      router.replace("/");
      return;
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  const RoleComponent = () => {
    if (!user) return null;
    console.log("🟢 Рендерим компонент для роли:", user.role);

    switch (user.role) {
      case "Администратор":
        return <Admin user={user} />;
      case "Руководитель":
        return <Director user={user} />;
      case "Сотрудник":
        return <Employee user={user} />;
      case "Специалист":
        return <Specialist user={user} />;
      default:
        return (
          <div className="text-center py-8">
            Роль не определена: {user.role}
          </div>
        );
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    );

  if (!user) return null;
  return (
    <main className="min-w-[360px] max-w-[1440px] mx-auto w-full p-2 bg-white text-gray-800 dark:bg-gray-800 dark:text-white">
      <RoleComponent />
    </main>
  );
}
