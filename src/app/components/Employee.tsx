import { UserData } from "@/types/users";

interface EmployeeProps {
  user: UserData;
}

export default function EmployeeDashboard({ user }: EmployeeProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
        Панель сотрудника
      </h2>
      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 dark:text-white">Мои задачи</h3>
          <p className="text-gray-600 dark:text-gray-400">Список текущих задач</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 dark:text-green-300">Рабочее время</h3>
          <p className="text-green-600 dark:text-green-400">Учет рабочего времени</p>
        </div>
      </div>
    </div>
  );
}