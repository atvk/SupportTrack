"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { UserData } from "@/types/users";
import Admin from "@/app/components/Admin";
import Director from "@/app/components/Director";
import Employee from "@/app/components/Employee";
import Specialist from "@/app/components/Specialist";

export default function UserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const users = await response.json();
          const foundUser = users.find((u: UserData) => u.id === userId);
          setUser(foundUser || null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const Role = () => {
    if (!user) return null;

    switch (user.role) {
      case "Админ":
        return <Admin user={user} />;
      case "Руководитель":
        return <Director/>;
      case "Сотрудник":
        return <Employee user={user} />;
      case "Специалист":
        return <Specialist user={user} />;
      default:
        return <div className="text-center py-8">Роль не определена</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Пользователь не найден
          </h1>
          <button
            onClick={() => router.push("/")}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <main
      className="min-w-[360px] max-w-[1440px] mx-auto w-full p-2
    justify-between items-center bg-white text-gray-800 dark:bg-gray-800 dark:text-white transition-colors"
    >
    <Role />
    </main>
  );
}
