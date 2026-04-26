import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { getPoolConfig } from "../../../lib/postgres";
import { isAdminSession, readSession } from "../../../lib/auth";

const pool = new Pool({
  ...getPoolConfig(),
});

async function ensureSpecialistDepartmentsTable(client: any) {
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
}

async function seedDefaultsIfEmpty(client: any) {
  const check = await client.query("SELECT COUNT(*)::int AS count FROM specialist_departments");
  if ((check.rows[0]?.count || 0) > 0) {
    return;
  }

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

export async function GET(request: NextRequest) {
  let client;
  try {
    const session = readSession(request);
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    client = await pool.connect();
    await ensureSpecialistDepartmentsTable(client);
    await seedDefaultsIfEmpty(client);

    const result = await client.query(
      `SELECT id, name, review_url, sort_order
       FROM specialist_departments
       ORDER BY sort_order ASC, id ASC`,
    );

    return NextResponse.json(
      result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        reviewUrl: row.review_url,
        sortOrder: row.sort_order,
      })),
    );
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: "Ошибка загрузки отделов: " + err.message }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}

export async function PUT(request: NextRequest) {
  let client;
  try {
    const session = readSession(request);
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const body = await request.json();
    const departments = Array.isArray(body?.departments) ? body.departments : null;
    if (!departments) {
      return NextResponse.json({ error: "Некорректный формат данных" }, { status: 400 });
    }

    client = await pool.connect();
    await ensureSpecialistDepartmentsTable(client);

    await client.query("BEGIN");
    await client.query("DELETE FROM specialist_departments");

    for (let i = 0; i < departments.length; i += 1) {
      const item = departments[i];
      const name = String(item?.name || "").trim();
      const reviewUrl = String(item?.reviewUrl || "#").trim() || "#";
      if (!name) continue;

      await client.query(
        "INSERT INTO specialist_departments (name, review_url, sort_order) VALUES ($1, $2, $3)",
        [name, reviewUrl, i + 1],
      );
    }

    await client.query("COMMIT");
    return NextResponse.json({ success: true });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }
    const err = error as Error;
    return NextResponse.json({ error: "Ошибка сохранения отделов: " + err.message }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
