import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { getPoolConfig } from "../../../lib/postgres";
import {
  ensureAdminUser,
  hashPassword,
  isAdminSession,
  readSession,
  validatePasswordPolicy,
} from "../../../lib/auth";
import { ensureCompanySchema } from "../../../lib/companySchema";

const pool = new Pool({
  ...getPoolConfig(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let client;

  try {
    const { id } = await params;
    const session = readSession(request);
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const canRead = isAdminSession(session) || String(session.id) === String(id);
    if (!canRead) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    client = await pool.connect();
    await ensureAdminUser(client);
    await ensureCompanySchema(client);

    const result = await client.query(
      `SELECT id, first_name, last_name, email, role, department, company_id,
              manager, avatar, has_full_access, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    const user = result.rows[0];
    return NextResponse.json({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      department: user.department,
      companyId: user.company_id,
      manager: user.manager,
      avatar: user.avatar,
      hasFullAccess: user.has_full_access,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: "Ошибка загрузки пользователя: " + err.message }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let client;

  try {
    const session = readSession(request);
    if (!isAdminSession(session)) {
      return NextResponse.json(
        { error: "Только администратор может изменять пользователей и роли" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      password,
      role,
      department,
      manager,
      avatar,
      hasFullAccess,
      companyId,
    } = body;

    client = await pool.connect();
    await ensureAdminUser(client);
    await ensureCompanySchema(client);

    // Проверяем существование
    const checkResult = await client.query(
      "SELECT id FROM users WHERE id = $1",
      [id],
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 },
      );
    }

    // Исправленный запрос - убираем CASE WHEN для password
    let queryText = "UPDATE users SET ";
    const queryParams: any[] = [];
    let paramCount = 1;

    if (firstName !== undefined) {
      queryText += `first_name = $${paramCount++}, `;
      queryParams.push(firstName);
    }
    if (lastName !== undefined) {
      queryText += `last_name = $${paramCount++}, `;
      queryParams.push(lastName);
    }
    if (email !== undefined) {
      queryText += `email = $${paramCount++}, `;
      queryParams.push(email);
    }
    if (password !== undefined && password !== "") {
      const passwordValidation = validatePasswordPolicy(password);
      if (!passwordValidation.valid) {
        return NextResponse.json({ error: passwordValidation.message }, { status: 400 });
      }
      const passwordHash = await hashPassword(password);
      queryText += `password = $${paramCount++}, `;
      queryParams.push(passwordHash);
    }
    if (role !== undefined) {
      queryText += `role = $${paramCount++}, `;
      queryParams.push(role);
    }
    if (department !== undefined) {
      queryText += `department = $${paramCount++}, `;
      queryParams.push(department);
    }
    if (manager !== undefined) {
      queryText += `manager = $${paramCount++}, `;
      queryParams.push(manager);
    }
    if (avatar !== undefined) {
      queryText += `avatar = $${paramCount++}, `;
      queryParams.push(avatar);
    }
    if (hasFullAccess !== undefined) {
      queryText += `has_full_access = $${paramCount++}, `;
      queryParams.push(hasFullAccess);
    }
    if (companyId !== undefined) {
      queryText += `company_id = $${paramCount++}, `;
      queryParams.push(companyId || null);
    }

    queryText += `updated_at = NOW() WHERE id = $${paramCount}`;
    queryParams.push(id);

    const result = await client.query(queryText, queryParams);

    // Получаем обновленного пользователя
    const getResult = await client.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    const updatedUser = getResult.rows[0];

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Не удалось получить обновленного пользователя" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      id: updatedUser.id,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      email: updatedUser.email,
      role: updatedUser.role,
      department: updatedUser.department,
      companyId: updatedUser.company_id,
      manager: updatedUser.manager,
      avatar: updatedUser.avatar,
      hasFullAccess: updatedUser.has_full_access,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at,
    });
  } catch (error) {
    const err = error as Error;

    return NextResponse.json(
      { error: "Ошибка обновления пользователя: " + err.message },
      { status: 500 },
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let client;

  try {
    const session = readSession(request);
    if (!isAdminSession(session)) {
      return NextResponse.json(
        { error: "Только администратор может удалять пользователей" },
        { status: 403 },
      );
    }

    const { id } = await params;
    client = await pool.connect();
    await ensureAdminUser(client);
    await ensureCompanySchema(client);

    const protectedUser = await client.query(
      "SELECT email FROM users WHERE id = $1",
      [id],
    );
    if (protectedUser.rows.length === 0) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }
    if ((protectedUser.rows[0].email as string).toLowerCase() === "steblovskiyanton@gmail.com") {
      return NextResponse.json({ error: "Нельзя удалить главного администратора" }, { status: 400 });
    }

    const result = await client.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
    }

    return NextResponse.json({ message: "Пользователь удален" });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ error: "Ошибка удаления пользователя: " + err.message }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
