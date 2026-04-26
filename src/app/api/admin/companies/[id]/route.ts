import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { getPoolConfig } from "../../../../lib/postgres";
import { isAdminSession, readSession } from "../../../../lib/auth";
import { ensureCompanySchema } from "../../../../lib/companySchema";

const pool = new Pool({
  ...getPoolConfig(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let client;
  try {
    const session = readSession(request);
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }
    const { id } = await params;

    client = await pool.connect();
    await ensureCompanySchema(client);
    const result = await client.query("SELECT id, name, created_at, updated_at FROM companies WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Компания не найдена" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: "Ошибка загрузки компании: " + err.message }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let client;
  try {
    const session = readSession(request);
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }
    const { id } = await params;
    const { name } = await request.json();
    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: "Название компании обязательно" }, { status: 400 });
    }

    client = await pool.connect();
    await ensureCompanySchema(client);
    const result = await client.query(
      "UPDATE companies SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, created_at, updated_at",
      [String(name).trim(), id],
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Компания не найдена" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: "Ошибка обновления компании: " + err.message }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let client;
  try {
    const session = readSession(request);
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }
    const { id } = await params;
    client = await pool.connect();
    await ensureCompanySchema(client);

    const result = await client.query("DELETE FROM companies WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Компания не найдена" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: "Ошибка удаления компании: " + err.message }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
