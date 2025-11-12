import { UserData } from "@/types/users";

interface SpecialistProps {
  user: UserData;
}

export default function SpecialistDashboard({ user }: SpecialistProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
        Панель специалиста
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300">Проекты</h3>
          <p className="text-blue-600 dark:text-blue-400">Управление проектами</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800 dark:text-purple-300">Аналитика</h3>
          <p className="text-purple-600 dark:text-purple-400">Аналитические отчеты</p>
        </div>
      </div>
    </div>
  );
}