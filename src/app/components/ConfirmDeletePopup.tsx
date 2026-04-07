import { XIcon, TrashIcon } from '@phosphor-icons/react';
import { UserData } from '@/src/types/users';

interface ConfirmDeletePopupProps {
  isOpen: boolean;
  user: UserData | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeletePopup({
  isOpen,
  user,
  onConfirm,
  onCancel,
}: ConfirmDeletePopupProps) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
              <TrashIcon size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Подтверждение удаления
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            type="button"
          >
            <XIcon size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Вы уверены, что хотите удалить пользователя?
          </p>
          
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-start space-x-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {user.firstName} {user.lastName}
                </p>
                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <p>ID: {user.id}</p>
                  {user.email && <p>Email: {user.email}</p>}
                  {user.email && !user.email && <p>Логин: {user.email}</p>}
                  {user.role && <p>Роль: {user.role}</p>}
                  {user.department && <p>Отдел: {user.department}</p>}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
              <span className="text-base">⚠️</span>
              Это действие невозможно отменить. Все данные пользователя будут безвозвратно удалены.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              type="button"
            >
              Отмена
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              type="button"
            >
              Удалить пользователя
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}