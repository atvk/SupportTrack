import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { getPoolConfig } from "../../../../../../lib/postgres";
import { isAdminSession, readSession } from "../../../../../../lib/auth";
import { ensureCompanySchema } from "../../../../../../lib/companySchema";

const pool = new Pool({
  ...getPoolConfig(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; departmentId: string }> },
) {
  let client;
  try {
    const session = readSession(request);
    if (!isAdminSession(session)) return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    const { id, departmentId } = await params;
    const { name } = await request.json();
    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: "Название отдела обязательно" }, { status: 400 });
    }

    client = await pool.connect();
    await ensureCompanySchema(client);
    const result = await client.query(
      "UPDATE company_departments SET name = $1, updated_at = NOW() WHERE id = $2 AND company_id = $3 RETURNING id, company_id, name, created_at, updated_at",
      [String(name).trim(), departmentId, id],
    );
    if (result.rows.length === 0) return NextResponse.json({ error: "Отдел не найден" }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: "Ошибка обновления отдела: " + err.message }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; departmentId: string }> },
) {
  let client;
  try {
    const session = readSession(request);
    if (!isAdminSession(session)) return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    const { id, departmentId } = await params;
    client = await pool.connect();
    await ensureCompanySchema(client);
    const result = await client.query("DELETE FROM company_departments WHERE id = $1 AND company_id = $2 RETURNING id", [
      departmentId,
      id,
    ]);
    if (result.rows.length === 0) return NextResponse.json({ error: "Отдел не найден" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: "Ошибка удаления отдела: " + err.message }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
