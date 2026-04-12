"use client";

import { CheckCircleIcon, XIcon } from "@phosphor-icons/react";

interface SuccessPopupProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export default function SuccessPopup({ isOpen, message, onClose }: SuccessPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="relative">
          {/* Зеленая полоска сверху */}
          <div className="h-2 bg-green-500"></div>
          
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircleIcon size={28} className="text-green-600 dark:text-green-400" weight="fill" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Успешно!
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {message}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XIcon size={20} />
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="mt-6 w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}