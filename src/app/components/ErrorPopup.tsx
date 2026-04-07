import { XCircleIcon } from '@phosphor-icons/react';

interface ErrorPopupProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

export default function ErrorPopup({ isOpen, message, onClose }: ErrorPopupProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <XCircleIcon size={24} className="text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ошибка</h2>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{message}</p>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}