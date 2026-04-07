"use client";

import { useState, useEffect, useRef } from "react";
import {
  XIcon,
  CameraIcon,
  BriefcaseIcon,
  UserIcon,
  UsersThreeIcon,
  GraduationCapIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import { UserData, UserInput } from "@/src/types/users";

interface AddEditUserPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserData | UserInput) => Promise<boolean>;
  onError: (message: string) => void;
  initialData?: UserData | null;
}

const roles = [
  {
    id: "Руководитель",
    icon: BriefcaseIcon,
    label: "Руководитель",
    description: "Полный доступ к системе",
  },
  {
    id: "Специалист",
    icon: UserIcon,
    label: "Специалист",
    description: "Расширенные возможности",
  },
  {
    id: "Сотрудник",
    icon: UsersThreeIcon,
    label: "Сотрудник",
    description: "Базовые функции",
  },
  {
    id: "Админ",
    icon: GraduationCapIcon,
    label: "Администратор",
    description: "Суперпользователь",
  },
];

export default function AddEditUserPopup({
  isOpen,
  onClose,
  onSave,
  onError,
  initialData,
}: AddEditUserPopupProps) {
  const [formData, setFormData] = useState<UserInput>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    department: "",
    role: "",
    avatar: "",
  });
  const [saving, setSaving] = useState(false);
  const isEditing = !!initialData;
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Закрытие по Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Закрытие по клику вне модалки
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Заполнение формы при открытии
  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        email: initialData.email || "",
        password: "",
        department: initialData.department || "",
        role: initialData.role || "",
        avatar: initialData.avatar || "",
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        department: "",
        role: "",
        avatar: "",
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      onError("Размер фотографии не должен превышать 2 МБ");
      return;
    }
    if (!file.type.startsWith("image/")) {
      onError("Пожалуйста, выберите файл изображения");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({
        ...prev,
        avatar: e.target?.result as string,
      }));
    };
    reader.onerror = () => onError("Ошибка при загрузке файла");
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setFormData((prev) => ({ ...prev, avatar: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация
    if (!formData.firstName?.trim()) {
      onError("Имя обязательно для заполнения");
      return;
    }
    
    if (!formData.lastName?.trim()) {
      onError("Фамилия обязательна для заполнения");
      return;
    }
    
    if (!formData.email?.trim()) {
      onError("Email обязателен для заполнения");
      return;
    }
    
    if (!isEditing && !formData.password?.trim()) {
      onError("Пароль обязателен для нового пользователя");
      return;
    }

    if (!formData.role) {
      onError("Пожалуйста, выберите роль пользователя");
      return;
    }

    setSaving(true);
    let success = false;
    
    if (isEditing && initialData) {
      const updateData: UserData = {
        id: initialData.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        department: formData.department,
        role: formData.role,
        avatar: formData.avatar,
        createdAt: initialData.createdAt,
        ...(formData.password && { password: formData.password }),
      };
      success = await onSave(updateData);
    } else {
      const { ...newUserData } = formData;
      success = await onSave(newUserData);
    }
    
    setSaving(false);
    if (success) {
      onClose();
    }
  };

  // Функция для проверки валидности формы
  const isFormValid = () => {
    if (!formData.role) return false;
    if (!formData.email?.trim()) return false;
    if (!formData.firstName?.trim()) return false;
    if (!formData.lastName?.trim()) return false;
    if (!isEditing && !formData.password?.trim()) return false;
    return true;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 flex justify-between items-center p-4 border-b dark:border-gray-700 z-10">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {isEditing ? "Редактировать пользователя" : "Добавить пользователя"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XIcon size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Загрузка фото */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
              Фотография пользователя (до 2 МБ)
            </label>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {formData.avatar ? (
                  <div className="relative">
                    <Image
                      width={128}
                      height={128}
                      src={formData.avatar}
                      alt={formData.firstName || "Avatar"}
                      className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500 shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <XIcon size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors"
                  >
                    <CameraIcon size={32} className="text-gray-400" />
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                  e.target.value = '';
                }}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
              >
                {formData.avatar ? "Изменить фото" : "Загрузить фото"}
              </button>
            </div>
          </div>

          {/* Имя и фамилия */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Имя *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                required
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Введите имя"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Фамилия *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                required
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Введите фамилию"
              />
            </div>
          </div>

          {/* Выбор роли (слайдер) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
              Роль пользователя *
            </label>
            <div className="relative px-2">
              <div className="absolute top-1/2 left-4 right-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full -translate-y-1/2 -z-10"></div>
              <div
                className="absolute top-1/2 left-4 h-1 bg-indigo-500 rounded-full -translate-y-1/2 -z-10 transition-all duration-300"
                style={{
                  width: `${
                    ((roles.findIndex((r) => r.id === formData.role) + 1) /
                      roles.length) *
                    100
                  }%`,
                }}
              ></div>
              <div className="flex justify-between relative">
                {roles.map((roleItem) => {
                  const IconComponent = roleItem.icon;
                  const isActive = formData.role === roleItem.id;
                  return (
                    <button
                      key={roleItem.id}
                      type="button"
                      onClick={() => handleChange("role", roleItem.id)}
                      className={`relative flex flex-col items-center transition-all duration-300 ${
                        isActive ? "scale-110" : "scale-100 hover:scale-105"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-full border-2 transition-all duration-300 ${
                          isActive
                            ? "bg-indigo-500 border-indigo-500 text-white shadow-lg"
                            : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-indigo-300"
                        }`}
                      >
                        <IconComponent
                          size={24}
                          weight={isActive ? "fill" : "regular"}
                        />
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full mt-2 transition-all duration-300 ${
                          isActive
                            ? "bg-indigo-500"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      ></div>
                      {isActive && (
                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 shadow-lg">
                          <CheckCircleIcon
                            size={12}
                            weight="fill"
                            className="text-white"
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="text-center mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {roles.find((r) => r.id === formData.role)?.label ||
                  "Выберите роль"}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {roles.find((r) => r.id === formData.role)?.description ||
                  "Нажмите на иконку выше"}
              </p>
            </div>
          </div>

          {/* Отдел */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Отдел
            </label>
            <input
              type="text"
              value={formData.department || ''}
              onChange={(e) => handleChange("department", e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors"
              placeholder="Например: Центр поддержки клиентов"
            />
          </div>

          {/* Логин (email) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Электронная почта *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors"
              placeholder="your@email.com"
            />
          </div>

          {/* Пароль */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isEditing
                ? "Новый пароль (оставьте пустым, если не менять)"
                : "Пароль *"}
            </label>
            <input
              type="password"
              value={formData.password || ''}
              onChange={(e) => handleChange("password", e.target.value)}
              required={!isEditing}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors"
              placeholder="Введите пароль"
            />
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition font-medium"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!isFormValid() || saving}
              className={`flex-1 py-3 px-4 rounded-lg transition font-medium shadow-md ${
                isFormValid() && !saving
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
              }`}
            >
              {saving ? "Сохранение..." : isEditing ? "Сохранить" : "Добавить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}