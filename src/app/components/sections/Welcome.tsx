'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { CrownIcon, UserGearIcon, UsersIcon, CheckCircleIcon } from "@phosphor-icons/react";

export default function Welcome() {
  const router = useRouter();
  const [role, setRole] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Проверка пароля в зависимости от роли
    if (
      (role === 'director' && password === '04') ||
      (role === 'specialist' && password === '10') ||
      (role === 'employee' && password === '85')
    ) {
      // Перенаправление на страницу роли
      router.push(`/${role}`);
    } else {
      alert('Неверный пароль для выбранной роли');
    }
  };

  const roles = [
    { id: 'director', icon: CrownIcon, label: 'Руководитель', description: 'Управление и аналитика' },
    { id: 'specialist', icon: UserGearIcon, label: 'Специалист', description: 'Профессиональная работа' },
    { id: 'employee', icon: UsersIcon, label: 'Сотрудник', description: 'Операционные задачи' }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900
     dark:to-gray-800 p-4 flex justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-8 max-w-md w-full transition-colors duration-300">
        
        {/* Заголовок */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Добро пожаловать
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Выберите вашу роль для входа в систему
          </p>
        </div>

        {/* Форма входа */}
        <form onSubmit={handleSubmit} className="space-y-2 grid gap-5">
          {/* Слайдер выбора роли - исправленная версия */}
          <div>
            <div className="relative p-4">
              {/* Фоновая линия */}
              <div className="absolute top-1/2 left-4 right-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full -translate-y-1/2 -z-10"></div>
              
              {/* Активная линия */}
              <div 
                className="absolute top-1/2 left-4 h-1 bg-indigo-500 rounded-full -translate-y-1/2 -z-10 transition-all duration-300"
                style={{
                  width: `${(roles.findIndex(r => r.id === role) / (roles.length - 1)) * (100 - 16)}%`
                }}
              ></div>

              {/* Контейнер иконок */}
              <div className="flex justify-between relative">
                {roles.map((roleItem) => {
                  const IconComponent = roleItem.icon;
                  const isActive = role === roleItem.id;
                  
                  return (
                    <button
                      key={roleItem.id}
                      type="button"
                      onClick={() => setRole(roleItem.id)}
                      className={`
                        relative flex flex-col items-center transition-all duration-300
                        ${isActive ? 'scale-110' : 'scale-100 hover:scale-105'}
                      `}
                    >
                      {/* Иконка */}
                      <div className={`
                        p-3 rounded-full border-2 transition-all duration-300
                        ${isActive 
                          ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg' 
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-indigo-300'
                        }
                      `}>
                        <IconComponent 
                          size={24} 
                          weight={isActive ? "fill" : "regular"}
                        />
                      </div>
                      
                      {/* Точка-индикатор */}
                      <div className={`
                        w-2 h-2 rounded-full mt-2 transition-all duration-300
                        ${isActive ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}
                      `}></div>
                      
                      {/* Галочка для активного состояния */}
                      {isActive && (
                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 shadow-lg">
                          <CheckCircleIcon size={12} weight="fill" className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Описание выбранной роли */}
            <div className="text-center mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {roles.find(r => r.id === role)?.label || 'Выберите роль'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {roles.find(r => r.id === role)?.description || 'Нажмите на иконку выше'}
              </p>
            </div>
          </div>
          {/* Поле логина (email) */}
          <div>
            <label htmlFor="login" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Электронная почта
            </label>
            <input
              type="email"
              id="login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="your@email.com"
            />
          </div>
          {/* Поле пароля */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Введите пароль"
            />
          </div>
          {/* Кнопка входа */}
          <button
            type="submit"
            disabled={!role}
            className={`
              w-full py-3 px-4 rounded-lg focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition font-medium shadow-md
              ${role 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }
            `}
          >
            Войти в систему
          </button>
        </form>
      </div>
    </main>
  );
}