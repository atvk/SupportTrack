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

function randomUsersCount(seed: string, department: string) {
  const base = `users:${seed}:${department}`;
  let hash = 7;
  for (let i = 0; i < base.length; i += 1) {
    hash = (hash * 33 + base.charCodeAt(i)) % 8191;
  }
  return (hash % 40) + 5;
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

    await client.query(`
      CREATE TABLE IF NOT EXISTS specialist_departments (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        review_url TEXT NOT NULL DEFAULT '#',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    const defaultsCheck = await client.query("SELECT COUNT(*)::int AS count FROM specialist_departments");
    if ((defaultsCheck.rows[0]?.count || 0) === 0) {
      const defaults = [
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
      for (let i = 0; i < defaults.length; i += 1) {
        await client.query(
          "INSERT INTO specialist_departments (name, review_url, sort_order) VALUES ($1, $2, $3)",
          [defaults[i], "#", i + 1],
        );
      }
    }

    const departmentResult = await client.query(
      `SELECT id, name, review_url
       FROM specialist_departments
       ORDER BY sort_order ASC, id ASC`,
    );

    const departmentStats = departmentResult.rows.map((row) => {
      const department = row.name as string;
      return {
        id: row.id,
        department,
        reviewUrl: (row.review_url as string) || "#",
        usersCount: randomUsersCount(currentUser.id, department),
        checkedByCurrentSpecialist: randomChecksByDepartment(currentUser.id, department),
      };
    });

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
