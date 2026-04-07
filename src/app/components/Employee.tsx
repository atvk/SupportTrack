import { UserData } from "@/src/types/users";

interface EmployeeProps {
  user: UserData;
}

export default function EmployeeDashboard({ user }: EmployeeProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
       Сотрудник
      </h2>
    </div>
  );
}