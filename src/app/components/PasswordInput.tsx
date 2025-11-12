import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function PasswordInput({
  value,
  onChange,
  placeholder = "Введите пароль",
  required = true,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 pr-12"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      >
        {showPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
      </button>
    </div>
  );
}