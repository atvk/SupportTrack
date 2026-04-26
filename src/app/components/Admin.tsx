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
import { useRouter } from "next/navigation";
import { UsersFourIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
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
  const router = useRouter();
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
  const [specialistDepartments, setSpecialistDepartments] = useState<
    { id?: number; name: string; reviewUrl: string }[]
  >([]);
  const [savingDepartments, setSavingDepartments] = useState(false);
  const [companies, setCompanies] = useState<{ id: number; name: string; employees_count?: number }[]>([]);
  const [companyPopupOpen, setCompanyPopupOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [editingCompanyId, setEditingCompanyId] = useState<number | null>(null);

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

  const loadCompanies = async () => {
    try {
      const res = await fetch("/api/admin/companies", { cache: "no-store" });
      if (!res.ok) {
        showError("Ошибка загрузки компаний");
        return;
      }
      const data = await res.json();
      setCompanies(data);
    } catch {
      showError("Ошибка сети при загрузке компаний");
    }
  };

  const loadSpecialistDepartments = async () => {
    try {
      const res = await fetch("/api/admin/specialist-departments", {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Ошибка загрузки отделов");
      }
      const data = await res.json();
      setSpecialistDepartments(data);
    } catch {
      showError("Не удалось загрузить настройки страницы специалиста");
    }
  };

  useEffect(() => {
    loadUsers();
    loadSpecialistDepartments();
    loadCompanies();
  }, []);

  const openAddCompanyPopup = () => {
    setEditingCompanyId(null);
    setCompanyName("");
    setCompanyPopupOpen(true);
  };

  const openEditCompanyPopup = (companyId: number, name: string) => {
    setEditingCompanyId(companyId);
    setCompanyName(name);
    setCompanyPopupOpen(true);
  };

  const saveCompany = async () => {
    if (!companyName.trim()) {
      showError("Название компании обязательно");
      return;
    }
    const isEditing = editingCompanyId !== null;
    try {
      const res = await fetch(
        isEditing ? `/api/admin/companies/${editingCompanyId}` : "/api/admin/companies",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: companyName.trim() }),
        },
      );
      if (!res.ok) {
        const err = await res.json();
        showError(err.error || "Ошибка сохранения компании");
        return;
      }
      setCompanyPopupOpen(false);
      setMessage(isEditing ? "✅ Компания обновлена" : "✅ Компания добавлена");
      await loadCompanies();
      setTimeout(() => setMessage(""), 3000);
    } catch {
      showError("Ошибка сети при сохранении компании");
    }
  };

  const deleteCompany = async (companyId: number) => {
    try {
      const res = await fetch(`/api/admin/companies/${companyId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        showError(err.error || "Ошибка удаления компании");
        return;
      }
      setMessage("✅ Компания удалена");
      await loadCompanies();
      setTimeout(() => setMessage(""), 3000);
    } catch {
      showError("Ошибка сети при удалении компании");
    }
  };

  const updateSpecialistDepartment = (
    index: number,
    field: "name" | "reviewUrl",
    value: string,
  ) => {
    setSpecialistDepartments((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addSpecialistDepartment = () => {
    setSpecialistDepartments((prev) => [...prev, { name: "", reviewUrl: "#" }]);
  };

  const removeSpecialistDepartment = (index: number) => {
    setSpecialistDepartments((prev) => prev.filter((_, i) => i !== index));
  };

  const saveSpecialistDepartments = async () => {
    setSavingDepartments(true);
    try {
      const payload = specialistDepartments
        .map((item) => ({
          name: item.name.trim(),
          reviewUrl: item.reviewUrl.trim() || "#",
        }))
        .filter((item) => item.name.length > 0);

      const res = await fetch("/api/admin/specialist-departments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ departments: payload }),
      });

      if (!res.ok) {
        const err = await res.json();
        showError(err.error || "Ошибка сохранения отделов");
        return;
      }

      setMessage("✅ Настройки специалиста сохранены");
      await loadSpecialistDepartments();
      setTimeout(() => setMessage(""), 3000);
    } catch {
      showError("Ошибка сети при сохранении отделов");
    } finally {
      setSavingDepartments(false);
    }
  };

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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Компании
                </h2>
                <button
                  onClick={openAddCompanyPopup}
                  className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  title="Добавить компанию"
                >
                  <UsersFourIcon size={32} />
                </button>
              </div>

              <div className="space-y-2">
                {companies.length === 0 ? (
                  <div className="text-gray-500">Компаний пока нет</div>
                ) : (
                  companies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => router.push(`/admin/company/${company.id}`)}
                    >
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white">{company.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          Сотрудников: {company.employees_count || 0}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditCompanyPopup(company.id, company.name);
                          }}
                          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <PencilSimpleIcon size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCompany(company.id);
                          }}
                          className="p-2 rounded-md hover:bg-red-100 text-red-600"
                        >
                          <TrashIcon size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Настройка страницы специалиста
                </h2>
                <button
                  onClick={addSpecialistDepartment}
                  className="rounded-md bg-indigo-600 text-white px-3 py-2 text-sm hover:bg-indigo-700"
                >
                  Добавить отдел
                </button>
              </div>

              <div className="space-y-3">
                {specialistDepartments.map((item, index) => (
                  <div key={`${item.id ?? "new"}-${index}`} className="grid md:grid-cols-12 gap-2">
                    <input
                      value={item.name}
                      onChange={(e) => updateSpecialistDepartment(index, "name", e.target.value)}
                      placeholder="Название отдела"
                      className="md:col-span-6 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
                    />
                    <input
                      value={item.reviewUrl}
                      onChange={(e) => updateSpecialistDepartment(index, "reviewUrl", e.target.value)}
                      placeholder="Ссылка на страницу проверки"
                      className="md:col-span-5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2"
                    />
                    <button
                      onClick={() => removeSpecialistDepartment(index)}
                      className="md:col-span-1 rounded-md bg-red-500 text-white px-2 py-2 hover:bg-red-600"
                    >
                      Удалить
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <button
                  onClick={saveSpecialistDepartments}
                  disabled={savingDepartments}
                  className="rounded-md bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700 disabled:opacity-60"
                >
                  {savingDepartments ? "Сохранение..." : "Сохранить отделы для специалиста"}
                </button>
              </div>
            </div>

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

        {companyPopupOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl p-5 shadow-xl">
              <h3 className="text-lg font-semibold mb-4">
                {editingCompanyId ? "Редактировать компанию" : "Добавить компанию"}
              </h3>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Название компании"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700"
              />
              <div className="mt-4 flex gap-2 justify-end">
                <button
                  onClick={() => setCompanyPopupOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
                >
                  Отмена
                </button>
                <button
                  onClick={saveCompany}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
