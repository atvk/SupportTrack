'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Briefcase, UsersThree } from "@phosphor-icons/react";
import { useEffect, useState } from 'react';

interface UserData {
  id: string;
  role: string;
  login: string;
  createdAt: string;
}

export default function UserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const users = await response.json();
          const foundUser = users.find((u: UserData) => u.id === userId);
          setUser(foundUser || null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleButtonClickBack = () => {
    router.back();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'director':
        return <Briefcase size={32} className="text-blue-600" weight="fill" />;
      case 'specialist':
        return <User size={32} className="text-green-600" weight="fill" />;
      case 'employee':
        return <UsersThree size={32} className="text-purple-600" weight="fill" />;
      default:
        return <User size={32} className="text-gray-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'director':
        return 'Руководитель';
      case 'specialist':
        return 'Специалист';
      case 'employee':
        return 'Сотрудник';
      default:
        return 'Пользователь';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Пользователь не найден
          </h1>
          <button
            onClick={() => router.push('/')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Шапка */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleButtonClickBack}
              className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Личный кабинет
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Персональная страница пользователя
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          {/* Информация о пользователе */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 dark:bg-indigo-900/20 rounded-full mb-4">
              {getRoleIcon(user.role)}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {user.login}
            </h2>
            <div className="inline-flex items-center px-4 py-2 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 rounded-full">
              <span className="font-medium">{getRoleLabel(user.role)}</span>
            </div>
          </div>

          {/* Детали пользователя */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Основная информация
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">ID пользователя</p>
                  <p className="font-mono text-sm text-gray-800 dark:text-white">{user.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="text-gray-800 dark:text-white">{user.login}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Дата регистрации</p>
                  <p className="text-gray-800 dark:text-white">
                    {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Доступные действия
              </h3>
              <div className="space-y-3">
                {user.role === 'director' && (
                  <button
                    onClick={() => router.push('/director')}
                    className="w-full text-left p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <p className="font-medium text-blue-800 dark:text-blue-300">Панель управления</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Управление пользователями</p>
                  </button>
                )}
                
                <button className="w-full text-left p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors">
                  <p className="font-medium text-green-800 dark:text-green-300">Мои задачи</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Просмотр и управление</p>
                </button>
                
                <button className="w-full text-left p-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors">
                  <p className="font-medium text-purple-800 dark:text-purple-300">Настройки</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Личные настройки</p>
                </button>
              </div>
            </div>
          </div>

          {/* Кнопка выхода */}
          <div className="text-center mt-8">
            <button
              onClick={() => router.push('/')}
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Выйти из системы
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}