import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { getPoolConfig } from "../../../../../lib/postgres";
import { isAdminSession, readSession } from "../../../../../lib/auth";
import { ensureCompanySchema } from "../../../../../lib/companySchema";

const pool = new Pool({
  ...getPoolConfig(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let client;
  try {
    const session = readSession(request);
    if (!isAdminSession(session)) return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    const { id } = await params;
    client = await pool.connect();
    await ensureCompanySchema(client);

    const result = await client.query(
      "SELECT id, company_id, name, created_at, updated_at FROM company_departments WHERE company_id = $1 ORDER BY id DESC",
      [id],
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: "Ошибка загрузки отделов: " + err.message }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let client;
  try {
    const session = readSession(request);
    if (!isAdminSession(session)) return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    const { id } = await params;
    const { name } = await request.json();
    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: "Название отдела обязательно" }, { status: 400 });
    }

    client = await pool.connect();
    await ensureCompanySchema(client);
    const result = await client.query(
      "INSERT INTO company_departments (company_id, name, updated_at) VALUES ($1, $2, NOW()) RETURNING id, company_id, name, created_at, updated_at",
      [id, String(name).trim()],
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: "Ошибка создания отдела: " + err.message }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
