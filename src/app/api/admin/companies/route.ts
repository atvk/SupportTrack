import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { getPoolConfig } from "../../../lib/postgres";
import { isAdminSession, readSession } from "../../../lib/auth";
import { ensureCompanySchema } from "../../../lib/companySchema";

const pool = new Pool({
  ...getPoolConfig(),
});

export async function GET(request: NextRequest) {
  let client;
  try {
    const session = readSession(request);
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    client = await pool.connect();
    await ensureCompanySchema(client);
    const result = await client.query(
      `SELECT c.id, c.name, c.created_at, c.updated_at, COUNT(u.id)::int AS employees_count
       FROM companies c
       LEFT JOIN users u ON u.company_id = c.id
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: "Ошибка загрузки компаний: " + err.message }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}

export async function POST(request: NextRequest) {
  let client;
  try {
    const session = readSession(request);
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const { name } = await request.json();
    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: "Название компании обязательно" }, { status: 400 });
    }

    client = await pool.connect();
    await ensureCompanySchema(client);
    const result = await client.query(
      "INSERT INTO companies (name, updated_at) VALUES ($1, NOW()) RETURNING id, name, created_at, updated_at",
      [String(name).trim()],
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: "Ошибка создания компании: " + err.message }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
