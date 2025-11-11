"use client";
import { useState, useEffect, useRef } from "react";
import {
  HeadsetIcon,
  SunIcon,
  MoonIcon,
  MagnifyingGlassIcon,
  SignInIcon,
  SignOutIcon,
  UserCircleIcon,
  XIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@phosphor-icons/react";
import Logo from "@/app/components/Logo";
import { ROUTES } from "@/utils/routes";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Theme = "light" | "dark";

export default function Header() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
    }
    return "light";
  });

  const [isSignInPopupOpen, setIsSignInPopupOpen] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  const router = useRouter();
  const popupRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    const newTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // Обработчик нажатия Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSignInPopupOpen) {
        closeSignInPopup();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isSignInPopupOpen]);

  // Обработчик клика вне попапа
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        closeSignInPopup();
      }
    };

    if (isSignInPopupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSignInPopupOpen]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme && savedTheme !== theme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, [theme]);

  useEffect(() => {
    const checkAuth = async () => {
      const userData = localStorage.getItem("currentUser");
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    };
    checkAuth();
  }, []);

  const openSignInPopup = () => {
    setIsSignInPopupOpen(true);
    setError("");
  };

  const closeSignInPopup = () => {
    setIsSignInPopupOpen(false);
    setLogin("");
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ login, password }),
      });

      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
        localStorage.setItem("currentUser", JSON.stringify(user));
        closeSignInPopup();

        // Перенаправляем в зависимости от роли
        switch (user.role) {
          case "director":
            router.push("/director");
            break;
          case "specialist":
            router.push("/specialist");
            break;
          case "employee":
            router.push("/employee");
            break;
          case "admin":
            router.push("/admin");
            break;
          default:
            router.push("/");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Ошибка входа");
      }
    } catch (error) {
      setError("Ошибка сети. Проверьте подключение к серверу.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    router.push("/");
  };

  const handleProfileClick = () => {
    if (currentUser) {
      router.push(`/users/${currentUser.id}`);
    }
  };

  return (
    <>
      <header
        className="min-w-[360px] max-w-[1440px] mx-auto w-full p-2 flex justify-between items-center bg-white text-gray-800 border-b border-b-gray-800 
        dark:border-b-white dark:bg-gray-800 transition-colors"
      >
        <div className="p-2 flex gap-2 justify-between items-center">
          <Logo />
          <h1
            className="text-gray-800 text-[clamp(12px,calc(8px+1.111vw),24px)]
           dark:text-white dark:bg-gray-800"
          >
            SupportTrack
          </h1>
        </div>

        <div className="p-2 flex gap-2 justify-between items-center">
          {theme === "light" ? (
            <SunIcon
              onClick={toggleTheme}
              className="text-gray-800 bg-white dark:text-white  
                  dark:bg-gray-800 cursor-pointer
              w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12"
            />
          ) : (
            <MoonIcon
              onClick={toggleTheme}
              className="text-gray-800 bg-white dark:text-white  
                  dark:bg-gray-800 cursor-pointer
              w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12"
            />
          )}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleProfileClick}
                className="flex items-center p-2 gap-2 "
              >
                {currentUser.avatar ? (
                  <Image
                    width={24}
                    height={24}
                    src={currentUser.avatar}
                    alt={currentUser.firstName}
                    className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12
                     rounded-full object-cover"
                  />
                ) : (
                  <UserCircleIcon
                    size={24}
                    className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12
                     text-gray-600 dark:text-gray-400"
                  />
                )}
                <div
                  className="grid justify-items-start text-[clamp(12px,calc(8px+1.111vw),24px)] text-gray-800 dark:text-white
                   opacity-0 scale-95 max-[760px]:hidden 
                   sm:opacity-100 
                   sm:scale-100 transition-all duration-300 
                  "
                >
                  {currentUser.login}
                </div>
              </button>
              <SignOutIcon
                onClick={handleLogout}
                className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12
                 bg-white text-gray-800 dark:text-white dark:bg-gray-800 cursor-pointer"
              />
            </div>
          ) : (
            <SignInIcon
              onClick={openSignInPopup}
              className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12
                 bg-white text-gray-800 dark:text-white dark:bg-gray-800 cursor-pointer"
            />
          )}
        </div>
      </header>
      {isSignInPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            ref={popupRef}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            {/* Заголовок и кнопка закрытия */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Вход в систему
              </h2>
              <button
                onClick={closeSignInPopup}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <XIcon size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSignInSubmit} className="space-y-6">
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
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 pr-12"
                    placeholder="Введите пароль"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeSlashIcon size={20} />
                    ) : (
                      <EyeIcon size={20} />
                    )}
                  </button>
                </div>
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
      )}
    </>
  );
}
