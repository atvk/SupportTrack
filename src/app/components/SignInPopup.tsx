import { useRef, useEffect } from "react";
import PopupHeader from "./PopupHeader";
import PasswordInput from "./PasswordInput";

interface SignInPopupProps {
  isOpen: boolean;
  onClose: () => void;
  login: string;
  setLogin: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isLoading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}

export default function SignInPopup({
  isOpen,
  onClose,
  login,
  setLogin,
  password,
  setPassword,
  isLoading,
  error,
  onSubmit,
}: SignInPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  // Обработчик нажатия Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Обработчик клика вне попапа
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        ref={popupRef}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
      >
        <PopupHeader title="Вход в систему" onClose={onClose} />
        
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Поле логина */}
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
              value={login}
              onChange={(e) => setLogin(e.target.value)}
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
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="Введите пароль"
            />
          </div>

          {/* Сообщение об ошибке */}
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Кнопка входа */}
          <button
            type="submit"
            disabled={!login || !password || isLoading}
            className={`
              w-full py-3 px-4 rounded-lg focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition font-medium shadow-md
              ${
                login && password && !isLoading
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
              }
            `}
          >
            {isLoading ? "Вход..." : "Войти в систему"}
          </button>
        </form>
      </div>
    </div>
  );
}