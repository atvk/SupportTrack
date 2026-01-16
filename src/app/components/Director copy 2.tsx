"use client";

import { useState, useEffect } from "react";
import UserTable from "@/app/components/UserTable";
import AddUserPopup from "@/app/components/AddUserPopup";
import { UserData } from "@/types/users";

interface AdminProps {
  user: UserData;
}

export default function Director({ user }: AdminProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [message, setMessage] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Загрузка пользователей
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      setMessage("Ошибка загрузки пользователей");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUserAdded = () => {
    setMessage("Пользователь успешно добавлен!");
    loadUsers();
    setIsPopupOpen(false);
  };

  return (
    <div
      className="mt-2 min-w-[360px] max-w-[1440px] mx-auto w-full rounded-xl
    items-center bg-white text-gray-800 dark:bg-gray-600 transition-colors"
    >
      <main className="w-full px-2 py-2">
        {message && (
          <div
            className={`p-4 rounded-lg mb-6 ${message.includes("успешно")
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
              }`}
          >
            {message}
          </div>
        )}

        <UserTable
          users={users}
          loading={usersLoading}
          onUsersUpdate={loadUsers}
          onMessage={setMessage}
        />
      </main>
      <AddUserPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onUserAdded={handleUserAdded}
        onMessage={setMessage}
      />
    </div>
  );
}

