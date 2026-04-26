import { NextResponse } from "next/server";
import { Pool } from "pg";
import { getPoolConfig } from "@/app/lib/postgres";

const pool = new Pool({
  ...getPoolConfig(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  let client;

  try {
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
    } = body;

    client = await pool.connect();

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
      queryText += `password = $${paramCount++}, `;
      queryParams.push(password);
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
