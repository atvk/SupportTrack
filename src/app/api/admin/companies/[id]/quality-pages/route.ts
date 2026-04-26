import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { getPoolConfig } from "../../../../../lib/postgres";
import { isAdminSession, readSession } from "../../../../../lib/auth";
import { ensureCompanySchema } from "../../../../../lib/companySchema";

const pool = new Pool({
  ...getPoolConfig(),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let client;
  try {
    const session = readSession(request);
    if (!isAdminSession(session)) return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    const { id } = await params;
    client = await pool.connect();
    await ensureCompanySchema(client);
    const result = await client.query(
      `SELECT qp.id, qp.company_id, qp.department_id, qp.title, qp.slug, qp.criteria, qp.created_at, d.name AS department_name
       FROM department_quality_pages qp
       LEFT JOIN company_departments d ON d.id = qp.department_id
       WHERE qp.company_id = $1
       ORDER BY qp.created_at DESC`,
      [id],
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: "Ошибка загрузки страниц проверки: " + err.message }, { status: 500 });
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
    const { title, departmentId, criteria } = await request.json();

    if (!title || !String(title).trim()) {
      return NextResponse.json({ error: "Название страницы обязательно" }, { status: 400 });
    }
    if (!Array.isArray(criteria) || criteria.length === 0) {
      return NextResponse.json({ error: "Добавьте хотя бы один критерий" }, { status: 400 });
    }

    client = await pool.connect();
    await ensureCompanySchema(client);

    const baseSlug = slugify(String(title).trim()) || `quality-${Date.now()}`;
    let slug = baseSlug;
    let suffix = 1;
    while (true) {
      const exists = await client.query(
        "SELECT id FROM department_quality_pages WHERE company_id = $1 AND slug = $2 LIMIT 1",
        [id, slug],
      );
      if (exists.rows.length === 0) break;
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const result = await client.query(
      `INSERT INTO department_quality_pages (company_id, department_id, title, slug, criteria, updated_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, NOW())
       RETURNING id, company_id, department_id, title, slug, criteria, created_at, updated_at`,
      [id, departmentId || null, String(title).trim(), slug, JSON.stringify(criteria)],
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: "Ошибка создания страницы проверки: " + err.message }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
