import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { getPoolConfig } from "../../../../../lib/postgres";
import { readSession } from "../../../../../lib/auth";
import { ensureCompanySchema } from "../../../../../lib/companySchema";

const pool = new Pool({
  ...getPoolConfig(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; slug: string }> },
) {
  let client;
  try {
    const session = readSession(request);
    if (!session?.id) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

    const { companyId, slug } = await params;
    client = await pool.connect();
    await ensureCompanySchema(client);

    const result = await client.query(
      `SELECT qp.id, qp.company_id, qp.department_id, qp.title, qp.slug, qp.criteria, d.name AS department_name
       FROM department_quality_pages qp
       LEFT JOIN company_departments d ON d.id = qp.department_id
       WHERE qp.company_id = $1 AND qp.slug = $2
       LIMIT 1`,
      [companyId, slug],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Страница проверки не найдена" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: "Ошибка загрузки страницы проверки: " + err.message }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}
