"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignIn, X, Eye, EyeSlash } from "@phosphor-icons/react";

const SignInIcon = () => {
  const router = useRouter();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignInClick = () => {
    setIsPopupOpen(true);
    setError('');
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setLogin('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });

      if (response.ok) {
        const user = await response.json();
        handleClosePopup();
        
        // Перенаправляем в зависимости от роли
        switch (user.role) {
          case 'director':
            router.push('/director');
            break;
          case 'specialist':
            router.push('/specialist');
            break;
          case 'employee':
            router.push('/employee');
            break;
          case 'admin':
            router.push('/admin');
            break;
          default:
            router.push('/');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Ошибка входа');
      }
    } catch (error) {
      setError('Ошибка сети. Проверьте подключение к серверу.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Иконка входа в Header */}
      <button
        onClick={handleSignInClick}
        className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
        title="Войти в систему"
      >
        <SignIn size={20} weight="bold" />
      </button>

      {/* Попап с формой входа */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            {/* Заголовок и кнопка закрытия */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Вход в систему
              </h2>
              <button
                onClick={handleClosePopup}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Форма входа */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Поле логина */}
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
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 pr-12"
                    placeholder="Введите пароль"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Сообщение об ошибке */}
              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Информация о тестовых пользователях (для демо) */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Тестовые доступы:
                </h3>
                <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                  <p><strong>Руководитель:</strong> director@test.com / 04</p>
                  <p><strong>Специалист:</strong> specialist@test.com / 10</p>
                  <p><strong>Сотрудник:</strong> employee@test.com / 85</p>
                  <p><strong>Админ:</strong> admin@test.com / admin123</p>
                </div>
              </div>

              {/* Кнопка входа */}
              <button
                type="submit"
                disabled={!login || !password || isLoading}
                className={`
                  w-full py-3 px-4 rounded-lg focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition font-medium shadow-md
                  ${login && password && !isLoading
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }
                `}
              >
                {isLoading ? "Вход..." : "Войти в систему"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default SignInIcon;