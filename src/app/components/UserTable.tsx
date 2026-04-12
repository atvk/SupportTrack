import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { UserData } from "@/src/types/users";

interface UserTableProps {
  users: UserData[];
  onEdit: (user: UserData) => void;
  onDelete: (user: UserData) => void;
}

export default function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-gray-500 dark:text-gray-400">Нет пользователей</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Аватар
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                ФИО
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Логин (Email)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Отдел
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Роль
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => onEdit(user)}
              >
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.firstName}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <>UserPic</>
                  )}
                 </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                  {user.lastName} {user.firstName}
                 </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user.email || '-'}
                 </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user.department || '-'}
                 </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {user.role || 'Пользователь'}
                  </span>
                 </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log(
                        "✏️ Редактируем пользователя:",
                        user.id,
                        user.firstName,
                      );
                      onEdit(user);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3 transition-colors"
                    title="Редактировать"
                  >
                    <PencilSimpleIcon size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("🔴 UserTable: удаляем пользователя:", {
                        id: user.id,
                        name: `${user.firstName} ${user.lastName}`,
                        email: user.email,
                      });
                      onDelete(user); // Исправлено: передаём весь объект user
                    }}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    title="Удалить"
                  >
                    <TrashIcon size={18} />
                  </button>
                 </td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}