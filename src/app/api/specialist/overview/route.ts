import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { getPoolConfig } from "../../../lib/postgres";
import { readSession } from "../../../lib/auth";

const pool = new Pool({
  ...getPoolConfig(),
});

function randomChecksByDepartment(seed: string, department: string) {
  const base = `${seed}:${department}`;
  let hash = 0;
  for (let i = 0; i < base.length; i += 1) {
    hash = (hash * 31 + base.charCodeAt(i)) % 9973;
  }
  return (hash % 25) + 1;
}

export async function GET(request: NextRequest) {
  let client;

  try {
    const session = readSession(request);
    if (!session?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    if (session.role !== "Специалист") {
      return NextResponse.json({ error: "Доступ только для специалистов" }, { status: 403 });
    }

    client = await pool.connect();

    const currentUserResult = await client.query(
      `SELECT id, first_name, last_name, role
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [session.id],
    );

    if (currentUserResult.rows.length === 0) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const currentUser = currentUserResult.rows[0];
    if (currentUser.role !== "Специалист") {
      return NextResponse.json({ error: "Доступ только для специалистов" }, { status: 403 });
    }

    const departmentResult = await client.query(
      `SELECT department, COUNT(*)::int AS count
       FROM users
       GROUP BY department`,
    );

    const departments = [
      "Юридический отдел - Работа с застройщики",
      "Юридический отдел - Общая практика",
      "Юридический отдел - Исполнительное производство",
      "Сопровождение отдел",
      "Отдел обучения",
      "Отдел продаж",
      "Колл-центр",
      "HR-отдел",
      "IT-отдел",
    ];

    const countMap = new Map<string, number>();
    for (const row of departmentResult.rows) {
      const departmentName = row.department || "Без отдела";
      countMap.set(departmentName, Number(row.count) || 0);
    }

    const departmentStats = departments.map((department) => ({
      department,
      usersCount: countMap.get(department) || 0,
      checkedByCurrentSpecialist: randomChecksByDepartment(currentUser.id, department),
    }));

    return NextResponse.json({
      specialist: {
        id: currentUser.id,
        firstName: currentUser.first_name,
        lastName: currentUser.last_name,
      },
      departments: departmentStats,
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: "Ошибка загрузки данных: " + err.message }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
