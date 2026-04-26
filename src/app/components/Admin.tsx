"use client";

import { UserPlusIcon } from "@phosphor-icons/react";
import { useMemo, useState, useEffect } from "react";
import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import UserTable from "@/src/app/components/UserTable";
import AddEditUserPopup from "@/src/app/components/AddEditUserPopup";
import ErrorPopup from "@/src/app/components/ErrorPopup";
import ConfirmDeletePopup from "@/src/app/components/ConfirmDeletePopup";
import { UserData, UserInput } from "@/src/types/users";

interface AdminProps {
  user: UserData;
}

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Admin({ user }: AdminProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [errorPopup, setErrorPopup] = useState({ isOpen: false, message: "" });
  const [deleteConfirmPopup, setDeleteConfirmPopup] = useState<{
    isOpen: boolean;
    user: UserData | null;
  }>({ isOpen: false, user: null });

  const showError = (msg: string) =>
    setErrorPopup({ isOpen: true, message: msg });
  const closeError = () => setErrorPopup({ isOpen: false, message: "" });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (res.ok) {
        const data = await res.json();
        console.log("📋 Загружено пользователей:", data.length);
        setUsers(data);
      } else {
        showError("Ошибка загрузки пользователей");
      }
    } catch {
      showError("Ошибка сети при загрузке");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (userData: UserInput) => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (res.ok) {
        setMessage("✅ Пользователь добавлен");
        await loadUsers();
        setTimeout(() => setMessage(""), 3000);
        return true;
      } else {
        const err = await res.json();
        showError(err.error || "Ошибка при добавлении");
        return false;
      }
    } catch {
      showError("Ошибка сети при добавлении");
      return false;
    }
  };

 const handleEditUser = async (userData: UserData) => {
  const { id, createdAt, ...updateData } = userData;
  
  try {
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
    });
    
    if (res.ok) {
      const updatedUser = await res.json();
      console.log("✅ Пользователь сохранён:", updatedUser);
      
      setMessage("✅ Пользователь сохранён");
      await loadUsers();
      
      // Обновляем localStorage, если это текущий пользователь
      const currentUserStr = localStorage.getItem("user");
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser.id === id) {
          // Обновляем данные в localStorage
          const updatedUserForStorage = {
            ...currentUser,
            id: updatedUser.id,
            firstName: updatedUser.firstName || updatedUser.first_name,
            lastName: updatedUser.lastName || updatedUser.last_name,
            email: updatedUser.email,
            role: updatedUser.role,
            department: updatedUser.department,
            avatar: updatedUser.avatar,
          };
          localStorage.setItem("user", JSON.stringify(updatedUserForStorage));
          
          // Отправляем событие в Header
          window.dispatchEvent(new Event('user-updated'));
          console.log("📢 Событие обновления отправлено");
        }
      }
      
      setTimeout(() => setMessage(""), 3000);
      return true;
    } else {
      const err = await res.json();
      showError(err.error || "Ошибка при сохранении");
      return false;
    }
  } catch (error) {
    console.error("❌ Сетевая ошибка:", error);
    showError("Ошибка сети при сохранении");
    return false;
  }
};

  const handleDeleteUser = async (userId: string) => {
    console.log("=".repeat(50));
    console.log("🗑️ УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ С ID:", userId);
    console.log("🗑️ Тип ID:", typeof userId);
    console.log("=".repeat(50));

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      console.log("📡 Статус ответа API:", res.status);

      if (res.ok) {
        setMessage("🗑️ Пользователь удалён");
        await loadUsers();
        setTimeout(() => setMessage(""), 3000);
      } else {
        const err = await res.json();
        console.error("❌ Ошибка API:", err);
        showError(err.error || "Ошибка при удалении");
      }
    } catch (error) {
      console.error("❌ Сетевая ошибка:", error);
      showError("Ошибка сети при удалении");
    }
  };

  const openDeleteConfirm = (user: UserData) => {
    setDeleteConfirmPopup({ isOpen: true, user });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmPopup({ isOpen: false, user: null });
  };

  const confirmDelete = () => {
    if (deleteConfirmPopup.user) {
      handleDeleteUser(deleteConfirmPopup.user.id);
      closeDeleteConfirm();
    }
  };

  const openEditPopup = (user: UserData) => {
    setEditingUser(user);
    setIsPopupOpen(true);
  };

  const openAddPopup = () => {
    setEditingUser(null);
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setEditingUser(null);
  };

  const handlePopupSave = async (data: UserData | UserInput) => {
    let success = false;
    if (editingUser) {
      success = await handleEditUser(data as UserData);
    } else {
      success = await handleAddUser(data as UserInput);
    }
    if (success) handlePopupClose();
    return success;
  };

  const usersByDepartment = useMemo(() => {
    const map = new Map<string, number>();
    users.forEach((userItem) => {
      const department = userItem.department?.trim() || "Без отдела";
      map.set(department, (map.get(department) || 0) + 1);
    });
    return Array.from(map.entries()).map(([department, count]) => ({
      department,
      count,
    }));
  }, [users]);

  const chartData = useMemo(
    () => ({
      labels: usersByDepartment.map((item) => item.department),
      datasets: [
        {
          label: "Сотрудники",
          data: usersByDepartment.map((item) => item.count),
          backgroundColor: [
            "#4f46e5",
            "#0ea5e9",
            "#10b981",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
            "#14b8a6",
            "#f97316",
            "#64748b",
            "#22c55e",
          ],
          borderWidth: 1,
        },
      ],
    }),
    [usersByDepartment],
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-m font-bold text-gray-800 dark:text-white">
            Управление пользователями
          </h1>
          <button
            onClick={openAddPopup}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <UserPlusIcon size={24} />
          </button>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg ${
              message.includes("✅") || message.includes("🗑️")
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {loading ? (
          <div className="text-center py-10 text-gray-500">Загрузка...</div>
        ) : (
          <>
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Распределение сотрудников по отделам
              </h2>
              {usersByDepartment.length > 0 ? (
                <div className="max-w-xl">
                  <Pie data={chartData} />
                </div>
              ) : (
                <div className="text-gray-500">Нет данных для диаграммы</div>
              )}
            </div>

            <UserTable
              users={users}
              onEdit={openEditPopup}
              onDelete={openDeleteConfirm}
            />
          </>
        )}

        <AddEditUserPopup
          isOpen={isPopupOpen}
          onClose={handlePopupClose}
          onSave={handlePopupSave}
          onError={showError}
          initialData={editingUser}
        />

        <ErrorPopup
          isOpen={errorPopup.isOpen}
          message={errorPopup.message}
          onClose={closeError}
        />

        <ConfirmDeletePopup
          isOpen={deleteConfirmPopup.isOpen}
          user={deleteConfirmPopup.user}
          onConfirm={confirmDelete}
          onCancel={closeDeleteConfirm}
        />
      </div>
    </div>
  );
}
