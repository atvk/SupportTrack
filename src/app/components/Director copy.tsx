"use client";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { useState, useEffect } from "react";
import { UserData } from "@/types/users";

// Регистрируем необходимые компоненты Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

interface DirectorProps {
  user: UserData;
}

export default function Director({ user }: DirectorProps) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setUsersLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Загрузка пользователей из JSON файла
   const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      setMessage("Ошибка загрузки пользователей");
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Подготовка данных для диаграммы
  const getChartData = () => {
    // Группируем пользователей по ролям
    const roleCount = users.reduce((acc: { [key: string]: number }, user) => {
      const role = user.role || "Не назначена";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    const roles = Object.keys(roleCount);
    const counts = Object.values(roleCount);

    // Цвета для сегментов диаграммы
    const backgroundColors = [
      "#FF6384", // Красный
      "#36A2EB", // Синий
      "#FFCE56", // Желтый
      "#4BC0C0", // Бирюзовый
      "#9966FF", // Фиолетовый
      "#FF9F40", // Оранжевый
      "#FF6384", // Розовый
      "#C9CBCF", // Серый
    ];

    return {
      labels: roles.map((role, index) => `${role} (${counts[index]})`),
      datasets: [
        {
          data: counts,
          backgroundColor: backgroundColors.slice(0, roles.length),
          hoverBackgroundColor: backgroundColors.slice(0, roles.length).map(color => 
            color + 'DD' // Добавляем прозрачность при наведении
          ),
          borderWidth: 3,
          borderColor: "#fff",
        },
      ],
    };
  };

  const chartOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 13,
            family: "'Inter', sans-serif",
          },
          color: "#4B5563",
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1F2937",
        bodyColor: "#374151",
        borderColor: "#E5E7EB",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const label = context.label.replace(/\(\d+\)/, '').trim();
            const value = context.parsed;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} сотрудников (${percentage}%)`;
          },
        },
      },
    },
    cutout: "55%",
  };

  // Получаем статистику по ролям для дополнительных карточек
  const getRoleStats = () => {
    const roleStats = users.reduce((acc: { [key: string]: number }, user) => {
      const role = user.role || "Не назначена";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(roleStats).map(([role, count]) => ({
      role,
      count,
      percentage: Math.round((count / users.length) * 100),
    }));
  };

  const roleStats = getRoleStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Шапка */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-3">
            Статистика сотрудников
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Визуализация распределения сотрудников по должностям и ролям в организации
          </p>
        </div>

        {/* Общая статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {users.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">
              Всего сотрудников
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {roleStats.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">
              Количество ролей
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {Math.max(...roleStats.map(stat => stat.count))}
            </div>
            <div className="text-gray-600 dark:text-gray-400 font-medium">
              Самая частая роль
            </div>
          </div>
        </div>

        {/* Сообщения */}
        {message && (
          <div
            className={`p-4 rounded-xl mb-6 ${
              message.includes("Ошибка")
                ? "bg-red-100 text-red-800 border border-red-200"
                : "bg-green-100 text-green-800 border border-green-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* Основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Диаграмма */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
              Распределение по ролям
            </h2>

            {loading ? (
              <div className="flex justify-center items-center h-80">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📊</div>
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  Нет данных для отображения
                </p>
                <button
                  onClick={loadUsers}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Загрузить данные
                </button>
              </div>
            ) : (
              <div className="relative h-80">
                <Doughnut data={getChartData()} options={chartOptions} />
              </div>
            )}
          </div>

          {/* Детальная статистика */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
              Детальная статистика
            </h2>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Данные о сотрудниках отсутствуют
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {roleStats
                  .sort((a, b) => b.count - a.count)
                  .map((stat, index) => (
                    <div
                      key={stat.role}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-800 dark:text-white">
                          {stat.role}
                        </span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {stat.count}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${stat.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span>{stat.percentage}% от общего числа</span>
                        <span>
                          {Math.round(stat.count / users.length * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Кнопка обновления */}
        <div className="text-center mt-8">
          <button
            onClick={loadUsers}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? "Загрузка..." : "Обновить данные"}
          </button>
        </div>
      </div>
    </div>
  );
}