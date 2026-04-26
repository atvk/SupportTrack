"use client";

import { useState, useEffect } from "react";
import {
  SunIcon,
  MoonIcon,
  SignIn,
  SignOut,
  UserCircle,
  UserSwitch,
} from "@phosphor-icons/react";
import Logo from "@/src/app/components/Logo";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SignInPopup from "./SignInPopup";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  login: string;
  email: string;
  role: string;
  department?: string;
  avatar?: string;
}

type Theme = "light" | "dark";

export default function Header() {
  const [user, setUser] = useState<UserData | null>(null);
  const [theme, setTheme] = useState<Theme>("light");
  const [isSignInPopupOpen, setIsSignInPopupOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const toggleTheme = () => {
    const newTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const loadUserFromStorage = () => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Ошибка парсинга user из localStorage", e);
      }
    }
  };

  // Функция для обновления пользователя с сервера
  const refreshUserFromServer = async () => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return;

    try {
      const currentUser = JSON.parse(savedUser);
      const response = await fetch(`/api/users/${currentUser.id}`);
      if (response.ok) {
        const updatedUser = await response.json();
        // Преобразуем поля из snake_case в camelCase
        const userData: UserData = {
          id: updatedUser.id,
          firstName: updatedUser.firstName || updatedUser.first_name,
          lastName: updatedUser.lastName || updatedUser.last_name,
          login: updatedUser.login || updatedUser.email,
          email: updatedUser.email,
          role: updatedUser.role,
          department: updatedUser.department,
          avatar: updatedUser.avatar,
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("🔄 Пользователь обновлен:", userData.firstName);
      }
    } catch (error) {
      console.error("Ошибка обновления пользователя:", error);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }

    loadUserFromStorage();

    // Слушаем событие обновления пользователя
    const handleUserUpdate = () => {
      console.log("📢 Событие обновления пользователя получено");
      // Просто перезагружаем из localStorage
      loadUserFromStorage();
    };

    window.addEventListener("user-updated", handleUserUpdate);

    return () => {
      window.removeEventListener("user-updated", handleUserUpdate);
    };
  }, []);

  const redirectToUserPage = (userId: string) => {
    router.push(`/users/${userId}`);
  };

  const redirectAfterLogin = (userData: UserData) => {
    if (userData.role === "Админ") {
      router.push(`/admin/${userData.id}`);
      return;
    }

    if (userData.role === "Специалист") {
      router.push(`/specialist/${userData.id}`);
      return;
    }

    redirectToUserPage(userData.id);
  };

  const openSignInPopup = () => {
    setIsSignInPopupOpen(true);
    setError("");
  };

  const closeSignInPopup = () => {
    setIsSignInPopupOpen(false);
    setEmail("");
    setPassword("");
    setError("");
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Ошибка парсинга JSON:", parseError);
        setError("Ошибка сервера. Попробуйте позже.");
        setIsLoading(false);
        return;
      }

      if (response.ok && data?.id) {
        const userData = data as UserData;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        closeSignInPopup();
        redirectAfterLogin(userData);
      } else {
        const errorMessage =
          data?.message ||
          data?.error ||
          `Ошибка ${response.status}: ${response.statusText}` ||
          "Неверный email или пароль";

        setError(errorMessage);
      }
    } catch (error) {
      console.error("Ошибка входа:", error);
      setError("Ошибка сети. Проверьте подключение к серверу.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/");
  };

  const handleProfileClick = () => {
    if (user) {
      if (user.role === "Админ") {
        router.push(`/admin/${user.id}`);
        return;
      }
      if (user.role === "Специалист") {
        router.push(`/specialist/${user.id}`);
        return;
      }
      redirectToUserPage(user.id);
    }
  };

  return (
    <>
      <header
        className="min-w-[360px] max-w-[1440px] w-full mx-auto
        flex justify-between items-center 
        bg-white text-gray-800 border-b border-b-gray-800 
        dark:border-b-white dark:bg-gray-800 dark:text-white transition-colors"
      >
        <Logo />

        <div className="p-2 flex gap-2 justify-between items-center">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={theme === "light" ? "Тёмная тема" : "Светлая тема"}
          >
            {theme === "light" ? <MoonIcon size={24} /> : <SunIcon size={24} />}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {user.avatar ? (
                  <Image
                    width={32}
                    height={32}
                    src={user.avatar}
                    alt={user.firstName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle size={24} />
                )}
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-medium">
                    {user.email || user.login}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {user.role}
                  </div>
                </div>
              </button>

              <button
                onClick={openSignInPopup}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Сменить пользователя"
              >
                <UserSwitch size={24} />
              </button>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Выйти"
              >
                <SignOut size={24} />
              </button>
            </div>
          ) : (
            <button
              onClick={openSignInPopup}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Войти"
            >
              <SignIn size={24} />
            </button>
          )}
        </div>
      </header>

      <SignInPopup
        isOpen={isSignInPopupOpen}
        onClose={closeSignInPopup}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        isLoading={isLoading}
        error={error}
        onSubmit={handleSignInSubmit}
      />
    </>
  );
}
