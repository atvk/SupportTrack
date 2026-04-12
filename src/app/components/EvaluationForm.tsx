"use client";

import { useState, useEffect } from "react";
import { CRITERIA, OK_VALUE } from "@/src/app/lib/constants";
import { Evaluation } from "@/src/app/lib/types";
import { CalendarBlankIcon, CalendarDotIcon, ExamIcon, UserIcon } from "@phosphor-icons/react";
import SuccessPopup from "./SuccessPopup";

// Функция для вычисления номера недели в году (1-53)
function getWeekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const oneDay = 86400000;
  const dayOfYear = Math.floor(diff / oneDay) + 1;
  return Math.ceil(dayOfYear / 7);
}

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department?: string;
  avatar?: string;
}

export default function EvaluationForm() {
  const [user, setUser] = useState<UserData | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const currentWeek = getWeekNumber(today);

  // Инициализация selectedErrors: для каждого критерия ставим "ok"
  const initialSelectedErrors = CRITERIA.reduce(
    (acc, criterion) => {
      acc[criterion.id] = OK_VALUE;
      return acc;
    },
    {} as Record<string, string>,
  );

  const [formData, setFormData] = useState({
    date: todayStr,
    week: currentWeek,
    contact: "",
    specialist: "",
    supervisor: "",
    topic: "",
    selectedErrors: initialSelectedErrors,
    csi: 0,
    inspector: "",
    comment: "",
  });

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Загрузка пользователей из базы данных
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        console.log("📋 Загружено пользователей:", data.length);
      } else {
        console.error("Ошибка загрузки пользователей");
      }
    } catch (error) {
      console.error("Ошибка:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Загрузка пользователя из localStorage и списка сотрудников при монтировании
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setFormData((prev) => ({
          ...prev,
          inspector: `${parsedUser.firstName} ${parsedUser.lastName}`,
        }));
      } catch (e) {
        console.error("Ошибка парсинга user из localStorage", e);
      }
    }
    
    loadUsers();
  }, []);

  // Обновление текстовых полей
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Обработка изменения select для критерия
  const handleCriterionChange = (criterionId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedErrors: {
        ...prev.selectedErrors,
        [criterionId]: value,
      },
    }));
  };

  // Расчёт итоговой оценки
  const calculateTotalScore = () => {
    const risksValue = formData.selectedErrors["risks"];
    if (risksValue && risksValue !== OK_VALUE) {
      return 0;
    }

    let total = 100;
    for (const criterion of CRITERIA) {
      if (criterion.weight > 0) {
        const selected = formData.selectedErrors[criterion.id];
        if (selected && selected !== OK_VALUE) {
          total -= criterion.weight;
        }
      }
    }
    return total;
  };

  const totalScore = calculateTotalScore();

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    const evaluation: Evaluation = {
      ...formData,
      week: Number(formData.week),
      csi: Number(formData.csi),
      totalScore,
    };

    try {
      const response = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evaluation),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка при сохранении");
      }

      // Показываем попап вместо alert
      setSuccessMessage("Тикет проверен");
      setShowSuccessPopup(true);
      
      // Очистка формы (кроме автоматических полей)
      setFormData({
        ...formData,
        contact: "",
        specialist: "",
        supervisor: "",
        topic: "",
        selectedErrors: initialSelectedErrors,
        csi: 0,
        comment: "",
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Неизвестная ошибка",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeSuccessPopup = () => {
    setShowSuccessPopup(false);
    setSuccessMessage("");
  };

  // Получаем отображаемое имя пользователя
  const getUserDisplayName = (user: UserData) => {
    return `${user.lastName} ${user.firstName}`;
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Форма оценки
        </h1>

        {/* Основные поля */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-wrap gap-6">
            {/* Круг с датой и неделей */}
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-500 dark:text-indigo-300 transition-transform hover:scale-105 cursor-default overflow-visible">
              <CalendarDotIcon
                size={40} 
                weight="light" 
                className="absolute opacity-30" 
                style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} 
              />
              <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold rounded-lg px-1.5 py-0.5 shadow-lg border border-indigo-200 dark:border-indigo-700 whitespace-nowrap">
                <div>Week {formData.week}</div>
                <div>{formatDate(formData.date)}</div>
              </div>
            </div>

            {/* Круг с итоговой оценкой */}
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-500 dark:text-indigo-300 transition-transform hover:scale-105 cursor-default overflow-visible">
              <ExamIcon
                size={40} 
                weight="light" 
                className="absolute opacity-30" 
                style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} 
              />
              <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold rounded-lg px-1.5 py-0.5 shadow-lg border border-indigo-200 dark:border-indigo-700 whitespace-nowrap">
                <div>{totalScore}</div>
              </div>
            </div>
          </div>

          {/* Контакт (ссылка) */}
          <div className="md:col-span-2">
            <label
              htmlFor="contact"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Контакт (ссылка)
            </label>
            <input
              type="url"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="https://..."
            />
          </div>

          {/* Специалист (выпадающий список) */}
          <div>
            <label
              htmlFor="specialist"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Специалист
            </label>
            <select
              id="specialist"
              name="specialist"
              value={formData.specialist}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 dark:text-white"
            >
              <option value="">Выберите специалиста</option>
              {loadingUsers ? (
                <option disabled>Загрузка...</option>
              ) : (
                users.map((user) => (
                  <option key={user.id} value={getUserDisplayName(user)}>
                    {getUserDisplayName(user)} - {user.role || 'Сотрудник'} {user.department ? `(${user.department})` : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* СВ/ТЛ (руководитель) */}
          <div>
            <label
              htmlFor="supervisor"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              СВ/ТЛ (Руководитель)
            </label>
            <select
              id="supervisor"
              name="supervisor"
              value={formData.supervisor}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 dark:text-white"
            >
              <option value="">Выберите руководителя</option>
              {loadingUsers ? (
                <option disabled>Загрузка...</option>
              ) : (
                users
                  .filter(u => u.role === 'Руководитель' || u.role === 'Админ' || u.role === 'Director')
                  .map((user) => (
                    <option key={user.id} value={getUserDisplayName(user)}>
                      {getUserDisplayName(user)} - {user.role || 'Руководитель'}
                    </option>
                  ))
              )}
            </select>
          </div>

          {/* Тематика обращения */}
          <div className="md:col-span-2">
            <label
              htmlFor="topic"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Тематика обращения
            </label>
            <input
              type="text"
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Критерии */}
        <div className="space-y-4">
          {CRITERIA.map((criterion) => (
            <div
              key={criterion.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <label
                htmlFor={`criteria-${criterion.id}`}
                className="block text-md font-medium text-gray-800 dark:text-gray-200 mb-3"
              >
                {criterion.name}
              </label>
              <select
                id={`criteria-${criterion.id}`}
                value={formData.selectedErrors[criterion.id]}
                onChange={(e) =>
                  handleCriterionChange(criterion.id, e.target.value)
                }
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 dark:text-white"
              >
                <option value={OK_VALUE}>OK (нет ошибок)</option>
                {criterion.errors.map((error) => (
                  <option key={error.id} value={error.id}>
                    {error.text}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Итоговая оценка */}
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            Итоговая оценка: {totalScore}
          </div>
          {formData.selectedErrors["risks"] !== OK_VALUE && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              ⚠️ Выбрана ошибка в «Имиджевые и бизнес-риски» – оценка обнулена.
            </p>
          )}
        </div>

        {/* Дополнительные поля */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="csi"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Оценка CSI
            </label>
            <input
              type="number"
              id="csi"
              name="csi"
              value={formData.csi}
              onChange={handleChange}
              min="0"
              max="10"
              step="1"
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 dark:text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Комментарий
            </label>
            <textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Сообщение об ошибке */}
        {submitError && (
          <div className="p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-lg text-sm">
            {submitError}
          </div>
        )}

        {/* Кнопка отправки */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            w-full py-3 px-4 rounded-lg focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition font-medium shadow-md
            ${
              isSubmitting
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }
          `}
        >
          {isSubmitting ? "Сохранение..." : "Сохранить оценку"}
        </button>
      </form>

      {/* Попап успеха */}
      <SuccessPopup
        isOpen={showSuccessPopup}
        message={successMessage}
        onClose={closeSuccessPopup}
      />
    </>
  );
}