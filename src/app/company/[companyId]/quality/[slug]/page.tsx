"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Criterion {
  label: string;
  type: "input" | "select";
  weight: number;
  options: string[];
}

export default function CompanyQualityPage() {
  const { companyId, slug } = useParams<{ companyId: string; slug: string }>();
  const [title, setTitle] = useState("");
  const [departmentName, setDepartmentName] = useState<string>("");
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string | string[]>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/company/${companyId}/quality-pages/${slug}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Ошибка загрузки страницы");
          return;
        }
        setTitle(data.title);
        setDepartmentName(data.department_name || "");
        setCriteria(Array.isArray(data.criteria) ? data.criteria : []);
      } catch {
        setError("Ошибка сети");
      }
    };
    load();
  }, [companyId, slug]);

  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">{title}</h1>
        {departmentName && <p className="text-gray-500 mb-4">Отдел: {departmentName}</p>}

        <div className="space-y-4">
          {criteria.map((criterion, index) => (
            <div key={`${criterion.label}-${index}`} className="border rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <label className="font-medium">{criterion.label}</label>
                <span className="text-sm text-gray-500">Вес: {criterion.weight}</span>
              </div>

              {criterion.type === "input" ? (
                <input
                  value={String(formValues[`c_${index}`] || "")}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, [`c_${index}`]: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Введите значение"
                />
              ) : (
                <select
                  multiple
                  value={Array.isArray(formValues[`c_${index}`]) ? (formValues[`c_${index}`] as string[]) : []}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                    setFormValues((prev) => ({ ...prev, [`c_${index}`]: values }));
                  }}
                  className="w-full border rounded px-3 py-2 min-h-[120px]"
                >
                  {criterion.options.map((option, i) => (
                    <option key={`${option}-${i}`} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
