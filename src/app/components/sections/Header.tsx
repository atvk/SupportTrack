"use client";
import { useState, useEffect } from "react";
import {
  HeadsetIcon,
  SunIcon,
  MoonIcon,
  DotsThreeOutlineVerticalIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
type Theme = "light" | "dark";

export default function Header() {
 
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light'; 
  });

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && savedTheme !== theme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  return (
    <header className="w-full p-4 flex justify-between items-center bg-white text-gray-800 border-b border-b-gray-800 
    dark:border-b-white dark:bg-gray-800 shadow-lg transition-colors duration-900">
      <div className="p-4 flex gap-5 justify-between items-center">
        <HeadsetIcon
          className="w-8 h-8 sm:w-10 sm:h-10 bg-white text-gray-800 dark:text-white dark:bg-gray-800"
        />
        <div className="text-gray-800 text-2xl font-bold dark:text-white dark:bg-gray-800">
          SupportTrack
        </div>
      </div>
      <div className="p-4 flex gap-5 justify-between items-center">
        <MagnifyingGlassIcon className="w-8 h-8 sm:w-10 sm:h-10 bg-white text-gray-800 dark:text-white dark:bg-gray-800" />
        {theme === "light" ? (
          <SunIcon
            onClick={toggleTheme}
            className="w-8 h-8 sm:w-10 sm:h-10 bg-white text-gray-800 dark:text-white dark:bg-gray-800"
          />
        ) : (
          <MoonIcon
            onClick={toggleTheme}
            className="w-8 h-8 sm:w-10 sm:h-10 bg-white text-gray-800 dark:text-white dark:bg-gray-800"
          />
        )}
        <DotsThreeOutlineVerticalIcon className="w-8 h-8 sm:w-10 sm:h-10 bg-white text-gray-800 dark:text-white dark:bg-gray-800" />
      </div>
    </header>
  );
}
