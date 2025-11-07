"use client";
import { PlusIcon } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import UserTable from "@/app/components/UserTable";
import AddUserPopup from "@/app/components/AddUserPopup";
import { UserData } from "@/types/users";

export default function DirectorPage() {
  
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Шапка */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Страница администратора
              </h1>
            </div>
          </div>

          <PlusIcon size={32} onClick={() => setIsPopupOpen(true)}/>

          
        </div>
      </div>

      {/* Основной контент */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Сообщения */}
        {message && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              message.includes("успешно")
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* Таблица пользователей */}
        <UserTable
          users={users}
          loading={usersLoading}
          onUsersUpdate={loadUsers}
          onMessage={setMessage}
        />
      </main>

      {/* Попап добавления пользователя */}
      <AddUserPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onUserAdded={handleUserAdded}
        onMessage={setMessage}
      />
    </div>
  );
}
