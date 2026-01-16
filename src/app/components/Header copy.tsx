"use client";
import { useState, useEffect } from "react";
import {
  SunIcon,
  MoonIcon,
  SignInIcon,
  SignOutIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import Logo from "@/app/components/Logo";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SignInPopup from "./SignInPopup";

type Theme = "light" | "dark";

export default function Header() {
  const [theme, setTheme] = useState<Theme>("light");
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
