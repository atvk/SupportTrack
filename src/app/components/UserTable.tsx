import { useState, useRef } from "react";
import Image from "next/image";
import {
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { UserData, Role } from "@/types/users";

interface UserTableProps {
  users: UserData[];
  loading: boolean;
  onUsersUpdate: () => void;
  onMessage: (message: string) => void;
}

const roles: Role[] = [
  {
    id: "director",
    icon: UserIcon,
    label: "Руководитель",
    description: "Полный доступ к системе",
  },
  {
    id: "specialist",
    icon: UserIcon,
    label: "Специалист",
    description: "Расширенные возможности",
  },
  {
    id: "employee",
    icon: UserIcon,
    label: "Сотрудник",
    description: "Базовые функции",
  },
  {
    id: "admin",
    icon: UserIcon,
    label: "Администратор",
    description: "Сурерюзер",
  },
];

export default function UserTable({ users, loading, onUsersUpdate, onMessage }: UserTableProps) {
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    role: "",
    login: "",
    password: "",
    firstName: "",
    lastName: "",
    avatar: null as string | null,
  });
  const [filters, setFilters] = useState({
    role: "",
    search: "",
  });
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const getRoleLabel = (roleId: string) => {
    return roles.find((r) => r.id === roleId)?.label || roleId;
  };

  const handleEditImageUpload = (file: File) => {
    return new Promise<void>((resolve, reject) => {
      if (file.size > 2 * 1024 * 1024) {
        onMessage("Размер фотографии не должен превышать 2 МБ");
        reject(new Error("File too large"));
        return;
      }

      if (!file.type.startsWith("image/")) {
        onMessage("Пожалуйста, выберите файл изображения");
        reject(new Error("Invalid file type"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setEditForm(prev => ({ ...prev, avatar: base64 }));
        resolve();
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const startEdit = (user: UserData) => {
    setEditingUser(user.id);
    setEditForm({
      role: user.role,
      login: user.login,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditForm({
      role: "",
      login: "",
      password: "",
      firstName: "",
      lastName: "",
      avatar: null,
    });
  };

  const handleEditChange = (field: string, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveEdit = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        onMessage("Пользователь успешно обновлен!");
        setEditingUser(null);
        onUsersUpdate();
      } else {
        const error = await response.json();
        onMessage(error.message || "Ошибка при обновлении пользователя");
      }
    } catch (error) {
      onMessage("Ошибка сети при обновлении пользователя");
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onMessage("Пользователь успешно удален!");
        onUsersUpdate();
      } else {
        const error = await response.json();
        onMessage(error.message || "Ошибка при удалении пользователя");
      }
    } catch (error) {
      onMessage("Ошибка сети при удалении пользователя");
    }
  };

  const removeEditAvatar = () => {
    setEditForm(prev => ({ ...prev, avatar: null }));
  };

  // Фильтрация пользователей
  const filteredUsers = users.filter((user) => {
    const matchesRole = !filters.role || user.role === filters.role;
    const matchesSearch = !filters.search || 
      user.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.login.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesRole && matchesSearch;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Заголовок и фильтры */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Список пользователей ({filteredUsers.length})
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Поиск */}
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon size={20} className="text-gray-400" />
              </div>
            </div>

            {/* Фильтр по роли */}
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Все роли</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Загрузка пользователей...
          </p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {users.length === 0 ? "Пользователи не найдены" : "Пользователи по заданным фильтрам не найдены"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Фото
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Имя
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Фамилия
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Роль
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Пароль
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Дата создания
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  {/* Фото */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser === user.id ? (
                      <div className="flex flex-col items-center space-y-2">
                        <div className="relative">
                          {editForm.avatar ? (
                            <Image
                              width={48}
                              height={48}
                              src={editForm.avatar}
                              alt="Preview"
                              className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <UserIcon
                                size={20}
                                className="text-gray-400"
                              />
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          ref={editFileInputRef}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleEditImageUpload(file).catch(() => {});
                            }
                          }}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => editFileInputRef.current?.click()}
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                        >
                          Изменить
                        </button>
                        {editForm.avatar && (
                          <button
                            type="button"
                            onClick={removeEditAvatar}
                            className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            Удалить
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                        {user.avatar ? (
                          <Image
                            width={48}
                            height={48}
                            src={user.avatar}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserIcon size={20} className="text-gray-400" />
                        )}
                      </div>
                    )}
                  </td>

                  {/* Имя */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser === user.id ? (
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) =>
                          handleEditChange("firstName", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.firstName}
                      </span>
                    )}
                  </td>

                  {/* Фамилия */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser === user.id ? (
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) =>
                          handleEditChange("lastName", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.lastName}
                      </span>
                    )}
                  </td>

                  {/* Роль */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser === user.id ? (
                      <select
                        value={editForm.role}
                        onChange={(e) =>
                          handleEditChange("role", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                      >
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-gray-900 dark:text-white">
                        {getRoleLabel(user.role)}
                      </span>
                    )}
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser === user.id ? (
                      <input
                        type="email"
                        value={editForm.login}
                        onChange={(e) =>
                          handleEditChange("login", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-900 dark:text-white">
                        {user.login}
                      </span>
                    )}
                  </td>

                  {/* Пароль */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser === user.id ? (
                      <input
                        type="text"
                        value={editForm.password}
                        onChange={(e) =>
                          handleEditChange("password", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                        placeholder="Новый пароль"
                      />
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ••••••••
                      </span>
                    )}
                  </td>

                  {/* Дата создания */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                  </td>

                  {/* Действия */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingUser === user.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveEdit(user.id)}
                          className="text-green-600 hover:text-green-900 dark:hover:text-green-400 transition-colors p-1"
                          title="Сохранить"
                        >
                          <CheckIcon size={18} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-600 hover:text-gray-900 dark:hover:text-gray-400 transition-colors p-1"
                          title="Отмена"
                        >
                          <XIcon size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEdit(user)}
                          className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 transition-colors p-1"
                          title="Редактировать"
                        >
                          <PencilIcon size={18} />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 dark:hover:text-red-400 transition-colors p-1"
                          title="Удалить"
                        >
                          <TrashIcon size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}