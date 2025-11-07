import { useEffect, useRef } from "react";
import AddUserForm from "./AddUserForm";

interface AddUserPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
  onMessage: (message: string) => void;
}

export default function AddUserPopup({ isOpen, onClose, onUserAdded, onMessage }: AddUserPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  // Закрытие по клику вне попапа
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Закрытие по Esc
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Блокировка скролла
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        ref={popupRef}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Добавить нового пользователя
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="text-2xl text-gray-500 dark:text-gray-400">×</span>
            </button>
          </div>
          
          <AddUserForm
            onUserAdded={onUserAdded}
            onMessage={onMessage}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}