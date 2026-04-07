"use client";

import { PlusIcon } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import UserTable from "@/src/app/components/UserTable";
import AddEditUserPopup from "@/src/app/components/AddEditUserPopup";
import ErrorPopup from "@/src/app/components/ErrorPopup";
import ConfirmDeletePopup from "@/src/app/components/ConfirmDeletePopup";
import { UserData, UserInput } from "@/src/types/users";

interface AdminProps {
  user: UserData;
}

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
      const res = await fetch("/api/users", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
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
        setMessage("✅ Пользователь сохранён");
        await loadUsers();
        setTimeout(() => setMessage(""), 3000);
        return true;
      } else {
        const err = await res.json();
        showError(err.error || "Ошибка при сохранении");
        return false;
      }
    } catch {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Управление пользователями
          </h1>
          <button
            onClick={openAddPopup}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <PlusIcon size={20} />
            Добавить пользователя
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
          <UserTable
            users={users}
            onEdit={openEditPopup}
            onDelete={openDeleteConfirm}
          />
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
