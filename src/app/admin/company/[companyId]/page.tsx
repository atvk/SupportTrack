"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ListChecksIcon, PlusIcon, UserPlusIcon, UsersFourIcon } from "@phosphor-icons/react";
import AddEditUserPopup from "@/src/app/components/AddEditUserPopup";
import ConfirmDeletePopup from "@/src/app/components/ConfirmDeletePopup";
import ErrorPopup from "@/src/app/components/ErrorPopup";
import UserTable from "@/src/app/components/UserTable";
import { UserData, UserInput } from "@/src/types/users";
import Link from "next/link";

type Department = { id: number; name: string };
type Criterion = { label: string; type: "input" | "select"; weight: number; options: string[] };

export default function CompanyPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const [company, setCompany] = useState<{ id: number; name: string } | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [qualityPages, setQualityPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorPopup, setErrorPopup] = useState({ isOpen: false, message: "" });

  const [isUserPopupOpen, setIsUserPopupOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [deleteConfirmPopup, setDeleteConfirmPopup] = useState<{ isOpen: boolean; user: UserData | null }>({
    isOpen: false,
    user: null,
  });

  const [isDepartmentPopupOpen, setIsDepartmentPopupOpen] = useState(false);
  const [departmentDraft, setDepartmentDraft] = useState("");
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const [isQualityPopupOpen, setIsQualityPopupOpen] = useState(false);
  const [qualityTitle, setQualityTitle] = useState("");
  const [qualityDepartmentId, setQualityDepartmentId] = useState<string>("");
  const [criteria, setCriteria] = useState<Criterion[]>([]);

  const showError = (msg: string) => setErrorPopup({ isOpen: true, message: msg });

  const loadAll = async () => {
    setLoading(true);
    try {
      const [companyRes, usersRes, departmentsRes, qualityRes] = await Promise.all([
        fetch(`/api/admin/companies/${companyId}`),
        fetch(`/api/users?companyId=${companyId}`),
        fetch(`/api/admin/companies/${companyId}/departments`),
        fetch(`/api/admin/companies/${companyId}/quality-pages`),
      ]);
      if (companyRes.ok) setCompany(await companyRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (departmentsRes.ok) setDepartments(await departmentsRes.json());
      if (qualityRes.ok) setQualityPages(await qualityRes.json());
    } catch {
      showError("Ошибка загрузки страницы компании");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [companyId]);

  const handleAddUser = async (userData: UserInput) => {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...userData, companyId: Number(companyId) }),
    });
    if (!res.ok) {
      const err = await res.json();
      showError(err.error || "Ошибка добавления пользователя");
      return false;
    }
    await loadAll();
    setMessage("✅ Пользователь добавлен");
    return true;
  };

  const handleEditUser = async (userData: UserData) => {
    const res = await fetch(`/api/users/${userData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...userData, companyId: Number(companyId) }),
    });
    if (!res.ok) {
      const err = await res.json();
      showError(err.error || "Ошибка редактирования пользователя");
      return false;
    }
    await loadAll();
    setMessage("✅ Пользователь обновлен");
    return true;
  };

  const handleDeleteUser = async (user: UserData) => {
    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      showError(err.error || "Ошибка удаления пользователя");
      return;
    }
    await loadAll();
    setMessage("✅ Пользователь удален");
  };

  const saveDepartment = async () => {
    if (!departmentDraft.trim()) return showError("Название отдела обязательно");
    const isEdit = Boolean(editingDepartment);
    const url = isEdit
      ? `/api/admin/companies/${companyId}/departments/${editingDepartment?.id}`
      : `/api/admin/companies/${companyId}/departments`;
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: departmentDraft.trim() }),
    });
    if (!res.ok) {
      const err = await res.json();
      showError(err.error || "Ошибка сохранения отдела");
      return;
    }
    setDepartmentDraft("");
    setEditingDepartment(null);
    await loadAll();
  };

  const deleteDepartment = async (departmentId: number) => {
    const res = await fetch(`/api/admin/companies/${companyId}/departments/${departmentId}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      showError(err.error || "Ошибка удаления отдела");
      return;
    }
    await loadAll();
  };

  const addCriterion = () => {
    setCriteria((prev) => [...prev, { label: "", type: "input", weight: 1, options: [] }]);
  };

  const updateCriterion = (idx: number, patch: Partial<Criterion>) => {
    setCriteria((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  };

  const createQualityPage = async () => {
    const normalized = criteria
      .filter((c) => c.label.trim())
      .map((c) => ({
        label: c.label.trim(),
        type: c.type,
        weight: Number(c.weight) || 0,
        options: c.type === "select" ? c.options.filter(Boolean) : [],
      }));
    if (!qualityTitle.trim()) return showError("Название страницы обязательно");
    if (normalized.length === 0) return showError("Добавьте критерии оценки");

    const res = await fetch(`/api/admin/companies/${companyId}/quality-pages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: qualityTitle.trim(),
        departmentId: qualityDepartmentId ? Number(qualityDepartmentId) : null,
        criteria: normalized,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      showError(err.error || "Ошибка создания страницы проверки");
      return;
    }
    setQualityTitle("");
    setQualityDepartmentId("");
    setCriteria([]);
    setIsQualityPopupOpen(false);
    await loadAll();
  };

  const qualityPreview = useMemo(() => criteria.filter((c) => c.label.trim()).length, [criteria]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Компания: {company?.name || "Загрузка..."}
        </h1>

        {message && <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-800 border border-green-200">{message}</div>}

        <div className="mb-4 flex flex-wrap gap-2">
          <button onClick={() => { setEditingUser(null); setIsUserPopupOpen(true); }} className="p-2 rounded-lg bg-indigo-600 text-white">
            <UserPlusIcon size={32} />
          </button>
          <button onClick={() => setIsDepartmentPopupOpen(true)} className="p-2 rounded-lg bg-indigo-600 text-white">
            <UsersFourIcon size={32} />
          </button>
          <button onClick={() => setIsQualityPopupOpen(true)} className="p-2 rounded-lg bg-indigo-600 text-white">
            <ListChecksIcon size={32} />
          </button>
        </div>

        {loading ? (
          <div className="text-gray-500">Загрузка...</div>
        ) : (
          <UserTable
            users={users}
            onEdit={(u) => { setEditingUser(u); setIsUserPopupOpen(true); }}
            onDelete={(u) => setDeleteConfirmPopup({ isOpen: true, user: u })}
          />
        )}

        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="font-semibold mb-2">Страницы проверки качества отдела</h2>
          <div className="space-y-2">
            {qualityPages.map((page) => (
              <Link
                key={page.id}
                href={`/company/${companyId}/quality/${page.slug}`}
                className="block rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {page.title}
              </Link>
            ))}
          </div>
        </div>

        <AddEditUserPopup
          isOpen={isUserPopupOpen}
          onClose={() => { setIsUserPopupOpen(false); setEditingUser(null); }}
          onSave={async (data) => (editingUser ? handleEditUser(data as UserData) : handleAddUser(data as UserInput))}
          onError={showError}
          initialData={editingUser}
        />

        <ConfirmDeletePopup
          isOpen={deleteConfirmPopup.isOpen}
          user={deleteConfirmPopup.user}
          onCancel={() => setDeleteConfirmPopup({ isOpen: false, user: null })}
          onConfirm={() => {
            if (deleteConfirmPopup.user) handleDeleteUser(deleteConfirmPopup.user);
            setDeleteConfirmPopup({ isOpen: false, user: null });
          }}
        />

        <ErrorPopup isOpen={errorPopup.isOpen} message={errorPopup.message} onClose={() => setErrorPopup({ isOpen: false, message: "" })} />

        {isDepartmentPopupOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-xl p-5">
              <h3 className="text-lg font-semibold mb-3">Отделы компании</h3>
              <div className="flex gap-2 mb-3">
                <input value={departmentDraft} onChange={(e) => setDepartmentDraft(e.target.value)} className="flex-1 border rounded px-3 py-2" placeholder="Название отдела" />
                <button onClick={saveDepartment} className="px-3 py-2 bg-indigo-600 text-white rounded">
                  {editingDepartment ? "Обновить" : "Добавить"}
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-auto">
                {departments.map((dep) => (
                  <div key={dep.id} className="flex justify-between items-center border rounded px-3 py-2">
                    <span>{dep.name}</span>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingDepartment(dep); setDepartmentDraft(dep.name); }} className="px-2 py-1 bg-gray-100 rounded">Ред.</button>
                      <button onClick={() => deleteDepartment(dep.id)} className="px-2 py-1 bg-red-100 text-red-700 rounded">Удал.</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right">
                <button onClick={() => setIsDepartmentPopupOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Закрыть</button>
              </div>
            </div>
          </div>
        )}

        {isQualityPopupOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-xl p-5 max-h-[90vh] overflow-auto">
              <h3 className="text-lg font-semibold mb-3">Создать страницу проверки качества отдела</h3>
              <input value={qualityTitle} onChange={(e) => setQualityTitle(e.target.value)} className="w-full border rounded px-3 py-2 mb-3" placeholder="Название страницы оценки" />
              <select value={qualityDepartmentId} onChange={(e) => setQualityDepartmentId(e.target.value)} className="w-full border rounded px-3 py-2 mb-4">
                <option value="">Без привязки к отделу</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <div className="space-y-3">
                {criteria.map((item, index) => (
                  <div key={index} className="border rounded p-3">
                    <div className="grid md:grid-cols-12 gap-2">
                      <input
                        value={item.label}
                        onChange={(e) => updateCriterion(index, { label: e.target.value })}
                        placeholder="Label параметра"
                        className="md:col-span-5 border rounded px-3 py-2"
                      />
                      <select
                        value={item.type}
                        onChange={(e) => updateCriterion(index, { type: e.target.value as "input" | "select", options: e.target.value === "select" ? item.options : [] })}
                        className="md:col-span-3 border rounded px-3 py-2"
                      >
                        <option value="input">Инпут</option>
                        <option value="select">Выпадающий список</option>
                      </select>
                      <input
                        type="number"
                        value={item.weight}
                        onChange={(e) => updateCriterion(index, { weight: Number(e.target.value) })}
                        className="md:col-span-3 border rounded px-3 py-2"
                        placeholder="Вес"
                      />
                      <button onClick={() => setCriteria((prev) => prev.filter((_, i) => i !== index))} className="md:col-span-1 bg-red-100 text-red-700 rounded px-2">
                        x
                      </button>
                    </div>
                    {item.type === "select" && (
                      <div className="mt-2">
                        <input
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const v = (e.currentTarget as HTMLInputElement).value.trim();
                              if (!v) return;
                              updateCriterion(index, { options: [...item.options, v] });
                              (e.currentTarget as HTMLInputElement).value = "";
                            }
                          }}
                          className="w-full border rounded px-3 py-2"
                          placeholder="Введите подпричину и нажмите Enter"
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.options.map((opt, oi) => (
                            <span key={`${opt}-${oi}`} className="px-2 py-1 bg-gray-100 rounded text-sm">{opt}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button onClick={addCriterion} className="mt-4 p-2 bg-indigo-600 text-white rounded-lg">
                <PlusIcon size={32} />
              </button>

              <div className="mt-4 text-sm text-gray-500">Добавлено критериев: {qualityPreview}</div>

              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setIsQualityPopupOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Отмена</button>
                <button onClick={createQualityPage} className="px-4 py-2 bg-emerald-600 text-white rounded">Создать страницу оценки</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
