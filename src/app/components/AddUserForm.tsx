import { useState, useRef } from "react";
import Image from "next/image";
import {
  BriefcaseIcon,
  UserIcon,
  UsersThreeIcon,
  CheckCircleIcon,
  CameraIcon,
  XIcon,
  GraduationCapIcon,
} from "@phosphor-icons/react";
import { NewUserData, Role } from "@/types/users";

interface AddUserFormProps {
  onUserAdded: () => void;
  onMessage: (message: string) => void;
  onCancel: () => void;
}

const roles: Role[] = [
  {
    id: "director",
    icon: BriefcaseIcon,
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
    icon: UsersThreeIcon,
    label: "Сотрудник",
    description: "Базовые функции",
  },
  {
    id: "admin",
    icon: GraduationCapIcon,
    label: "Администратор",
    description: "Сурерюзер",
  },
];

export default function AddUserForm({ onUserAdded, onMessage, onCancel }: AddUserFormProps) {
  const [newUser, setNewUser] = useState<NewUserData>({
    role: "",
    login: "",
    password: "",
    firstName: "",
    lastName: "",
    avatar: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setNewUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (file: File) => {
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
        setNewUser((prev) => ({ ...prev, avatar: base64 }));
        resolve();
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const removeAvatar = () => {
    setNewUser((prev) => ({ ...prev, avatar: null }));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    onMessage("");

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (response.ok) {
        onUserAdded();
        setNewUser({
          role: "",
          login: "",
          password: "",
          firstName: "",
          lastName: "",
          avatar: null,
        });
      } else {
        onMessage(data.message || "Ошибка при добавлении пользователя");
      }
    } catch (error) {
      onMessage("Ошибка сети. Проверьте подключение к серверу.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleAddUser} className="space-y-6">
      {/* Загрузка фото */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
          Фотография пользователя (до 2 МБ)
        </label>

        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {newUser.avatar ? (
              <div className="relative">
                <Image
                  width={128}
                  height={128}
                  src={newUser.avatar}
                  alt={newUser.firstName}
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
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors"
              >
                <CameraIcon size={32} className="text-gray-400" />
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleImageUpload(file).catch(() => {});
              }
            }}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            {newUser.avatar ? "Изменить фото" : "Загрузить фото"}
          </button>
        </div>
      </div>

      {/* Поля имени и фамилии */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Имя
          </label>
          <input
            type="text"
            id="firstName"
            value={newUser.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            required
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Введите имя"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Фамилия
          </label>
          <input
            type="text"
            id="lastName"
            value={newUser.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            required
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Введите фамилию"
          />
        </div>
      </div>

      {/* Слайдер выбора роли */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
          Роль пользователя
        </label>

        <div className="relative px-2">
          <div className="absolute top-1/2 left-4 right-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full -translate-y-1/2 -z-10"></div>

          <div
            className="absolute top-1/2 left-4 h-1 bg-indigo-500 rounded-full -translate-y-1/2 -z-10 transition-all duration-300"
            style={{
              width: `${
                (roles.findIndex((r) => r.id === newUser.role) /
                  (roles.length - 1)) *
                (100 - 16)
              }%`,
            }}
          ></div>

          <div className="flex justify-between relative">
            {roles.map((roleItem) => {
              const IconComponent = roleItem.icon;
              const isActive = newUser.role === roleItem.id;

              return (
                <button
                  key={roleItem.id}
                  type="button"
                  onClick={() => handleInputChange("role", roleItem.id)}
                  className={`
                    relative flex flex-col items-center transition-all duration-300
                    ${isActive ? "scale-110" : "scale-100 hover:scale-105"}
                  `}
                >
                  <div
                    className={`
                      p-3 rounded-full border-2 transition-all duration-300
                      ${
                        isActive
                          ? "bg-indigo-500 border-indigo-500 text-white shadow-lg"
                          : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-indigo-300"
                      }
                    `}
                  >
                    <IconComponent
                      size={24}
                      weight={isActive ? "fill" : "regular"}
                    />
                  </div>

                  <div
                    className={`
                      w-2 h-2 rounded-full mt-2 transition-all duration-300
                      ${
                        isActive
                          ? "bg-indigo-500"
                          : "bg-gray-300 dark:bg-gray-600"
                      }
                    `}
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
            {roles.find((r) => r.id === newUser.role)?.label || "Выберите роль"}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {roles.find((r) => r.id === newUser.role)?.description ||
              "Нажмите на иконку выше"}
          </p>
        </div>
      </div>

      {/* Поле логина (email) */}
      <div>
        <label
          htmlFor="login"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Электронная почта
        </label>
        <input
          type="email"
          id="login"
          value={newUser.login}
          onChange={(e) => handleInputChange("login", e.target.value)}
          required
          className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="your@email.com"
        />
      </div>

      {/* Поле пароля */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Пароль
        </label>
        <input
          type="password"
          id="password"
          value={newUser.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          required
          className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          placeholder="Введите пароль"
        />
      </div>

      {/* Кнопки */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 px-4 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={
            !newUser.role ||
            !newUser.login ||
            !newUser.password ||
            !newUser.firstName ||
            !newUser.lastName ||
            isLoading
          }
          className={`
            flex-1 py-3 px-4 rounded-lg focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition font-medium shadow-md
            ${
              newUser.role &&
              newUser.login &&
              newUser.password &&
              newUser.firstName &&
              newUser.lastName &&
              !isLoading
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }
          `}
        >
          {isLoading ? "Добавление..." : "Добавить пользователя"}
        </button>
      </div>
    </form>
  );
}