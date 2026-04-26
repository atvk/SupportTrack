"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DepartmentStats {
  department: string;
  usersCount: number;
  checkedByCurrentSpecialist: number;
}

interface SpecialistOverviewResponse {
  specialist: {
    id: string;
    firstName: string;
    lastName: string;
  };
  departments: DepartmentStats[];
}

const COLORS = [
  "#4f46e5",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#f97316",
  "#64748b",
];

export default function SpecialistPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<SpecialistOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOverview = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/specialist/overview", {
          cache: "no-store",
        });

        if (res.status === 401) {
          router.replace("/");
          return;
        }
        if (res.status === 403) {
          const stored = localStorage.getItem("user");
          if (stored) {
            const currentUser = JSON.parse(stored) as { id: string };
            router.replace(`/users/${currentUser.id}`);
          } else {
            router.replace("/");
          }
          return;
        }

        const payload = (await res.json()) as SpecialistOverviewResponse | { error: string };
        if (!res.ok || !("specialist" in payload)) {
          setError(("error" in payload && payload.error) || "Ошибка загрузки данных специалиста");
          return;
        }

        if (String(payload.specialist.id) !== String(id)) {
          router.replace(`/specialist/${payload.specialist.id}`);
          return;
        }

        setData(payload);
      } catch {
        setError("Ошибка сети при загрузке страницы специалиста");
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [id, router]);

  const chartData = useMemo(() => {
    const labels = data?.departments.map((item) => item.department) || [];
    const values = data?.departments.map((item) => item.usersCount) || [];
    return {
      labels,
      datasets: [
        {
          label: "Сотрудников в отделе",
          data: values,
          backgroundColor: COLORS,
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Загрузка страницы специалиста...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Страница специалиста проверки
        </h1>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Отделы
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {data.departments.map((item) => (
              <Link
                key={item.department}
                href="#"
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="font-medium text-gray-800 dark:text-white">{item.department}</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">
                  Проверено этим специалистом (временно): {item.checkedByCurrentSpecialist}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Распределение сотрудников по отделам
          </h2>
          <div className="max-w-xl">
            <Pie data={chartData} />
          </div>
        </section>
      </div>
    </main>
  );
}
