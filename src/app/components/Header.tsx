"use client";
import { useState, useEffect } from "react";
import {
  SunIcon,
  MoonIcon,
  SignInIcon,
  SignOutIcon,
  UserCircleIcon,
  UserSwitchIcon,
  ClipboardTextIcon,
  UserPlusIcon,
  PencilIcon,
  TableIcon 
} from "@phosphor-icons/react";
import Logo from "@/app/components/Logo";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SignInPopup from "./SignInPopup";

type Theme = "light" | "dark";
type ActiveTab = "plan" | "entry" | "changes";

export default function Header() {
  const [theme, setTheme] = useState<Theme>("light");
  const [activeTab, setActiveTab] = useState<ActiveTab>("entry");
  const [isSignInPopupOpen, setIsSignInPopupOpen] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  const router = useRouter();

  const toggleTheme = () => {
    const newTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const userData = localStorage.getItem("currentUser");
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        redirectToUserPage(user.id);
      }
    };
    checkAuth();
  }, []);

  const redirectToUserPage = (userId: string) => {
    router.push(`/users/${userId}`);
  };

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

        // Перенаправляем на личную страницу пользователя
        redirectToUserPage(user.id);
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
      redirectToUserPage(currentUser.id);
    }
  };

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    switch (tab) {
      case "plan":
        router.push("/inspection");
        break;
      case "entry":
        router.push("/entry");
        break;
      case "changes":
        router.push("/changes");
        break;
    }
  };

  return (
    <>
      <header
        className="min-w-[360px] max-w-[1440px] w-full px-4 sm:px-5 p-2 mx-auto
        flex justify-between items-center 
        bg-white text-gray-800 border-b border-b-gray-800 
        dark:border-b-white dark:bg-gray-800 dark:text-white transition-colors"
      >
        {/* Левая часть: Логотип */}
        <div className="p-2 flex gap-2 justify-between items-center">
          <TableIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10
                 bg-white text-gray-800 dark:text-white dark:bg-gray-800 cursor-pointer" />
        </div>

        {/* Центральная часть: Навигация с кнопками - показывается только для авторизованных пользователей */}
        {currentUser && (
          <nav className="flex items-center gap-1 sm:gap-2">
            {/* Кнопка "Плановая проверка" */}
            <button
              onClick={() => handleTabClick("plan")}
              className={`
                flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200
                ${activeTab === "plan" 
                  ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700" 
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"
                }
              `}
            >
              <ClipboardTextIcon 
                size={20} 
                weight={activeTab === "plan" ? "fill" : "regular"}
                className={activeTab === "plan" ? "text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400"}
              />
              <span className="font-medium whitespace-nowrap hidden lg:inline">
                Плановая проверка
              </span>
            </button>

            {/* Кнопка "Вступление" - активная по умолчанию */}
            <button
              onClick={() => handleTabClick("entry")}
              className={`
                flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200
                ${activeTab === "entry" 
                  ? "bg-gray-600 text-white border border-blue-700 shadow-sm" 
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"
                }
              `}
            >
              <UserPlusIcon 
                size={20} 
                weight={activeTab === "entry" ? "fill" : "regular"}
                className={activeTab === "entry" ? "text-white" : "text-gray-500 dark:text-gray-400"}
              />
              <span className="font-medium whitespace-nowrap hidden lg:inline">
                Вступление
              </span>
            </button>

            {/* Кнопка "Изменения" */}
            <button
              onClick={() => handleTabClick("changes")}
              className={`
                flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200
                ${activeTab === "changes" 
                  ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700" 
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"
                }
              `}
            >
              <PencilIcon 
                size={20} 
                weight={activeTab === "changes" ? "fill" : "regular"}
                className={activeTab === "changes" ? "text-purple-600 dark:text-purple-400" : "text-gray-500 dark:text-gray-400"}
              />
              <span className="font-medium whitespace-nowrap hidden lg:inline">
                Изменения
              </span>
            </button>
          </nav>
        )}

        {/* Правая часть: Переключение темы и управление пользователем */}
        <div className="p-2 flex gap-2 justify-between items-center">
          
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleProfileClick}
                className="flex items-center p-2 gap-2"
              >
                {currentUser.avatar ? (
                  <Image
                    width={24}
                    height={24}
                    src={currentUser.avatar}
                    alt={currentUser.firstName}
                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10
                     rounded-full object-cover"
                  />
                ) : (
                  <UserCircleIcon
                    size={24}
                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10
                     text-gray-600 dark:text-gray-400"
                  />
                )}
                <div
                  className="grid justify-items-start text-[clamp(10px,calc(10px+1.111vw),16px)] text-gray-800 dark:text-white
                   opacity-0 scale-95 max-[1024px]:hidden 
                   lg:opacity-100 
                   lg:scale-100 transition-all duration-300 
                  "
                >
                  <span>{currentUser.login}</span>
                  <span>{currentUser.role}</span>
                </div>
              </button>
              <UserSwitchIcon
                onClick={openSignInPopup}
                className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10
                 bg-white text-gray-800 dark:text-white
                  dark:bg-gray-800 cursor-pointer"
              />
              <SignOutIcon
                onClick={handleLogout}
                className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10
                 bg-white text-gray-800 dark:text-white dark:bg-gray-800 cursor-pointer"
              />
            </div>
          ) : (
            <SignInIcon
              onClick={openSignInPopup}
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10
                 bg-white text-gray-800 dark:text-white dark:bg-gray-800 cursor-pointer"
            />
          )}
        </div>
      </header>

      <SignInPopup
        isOpen={isSignInPopupOpen}
        onClose={closeSignInPopup}
        login={login}
        setLogin={setLogin}
        password={password}
        setPassword={setPassword}
        isLoading={isLoading}
        error={error}
        onSubmit={handleSignInSubmit}
      />
    </>
  );
}