"use client";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react";

export default function SpecialistPage() {
  const router = useRouter();
  const handleButtonClickBack = () => {
    router.back();
  };

  return (
    <div
      className="w-full min-h-screen p-4 flex bg-white text-gray-800 
    dark:bg-gray-800 shadow-lg transition-colors duration-900"
    >
      <div className="p-4 flex gap-5 justify-between items-start">
        <ArrowLeftIcon
          size={22}
          onClick={handleButtonClickBack}
          className="cursor-pointer w-8 h-8 sm:w-10 sm:h-10 bg-white text-gray-800 dark:text-white dark:bg-gray-800"
        />
        <h1 className="text-gray-800 text-2xl font-bold dark:text-white dark:bg-gray-800">
          Специалист
        </h1>
      </div>
    </div>
  );
}
