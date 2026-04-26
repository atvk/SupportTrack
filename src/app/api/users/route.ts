import { NextResponse } from "next/server";
import { Pool } from "pg";
import { getPoolConfig } from "../../lib/postgres";

// Создаем пул соединений
const pool = new Pool({
  ...getPoolConfig(),
});

export async function GET() {
  try {
    const client = await pool.connect();

    try {
      const result = await client.query(`
        SELECT id, first_name, last_name, email, role, department, 
               manager, avatar, has_full_access, created_at, updated_at
        FROM users 
        ORDER BY created_at DESC
      `);

    
      const users = result.rows.map((row) => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        role: row.role,
        department: row.department,
        manager: row.manager,
        avatar: row.avatar,
        hasFullAccess: row.has_full_access,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      return NextResponse.json(users);
    } finally {
      client.release();
    }
  } catch (error) {
    const err = error as Error;
    
    return NextResponse.json(
      { error: "Ошибка загрузки пользователей: " + err.message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let client;

  try {
    
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

    // Валидация
    if (!firstName || !lastName) {
      
      return NextResponse.json(
        { error: "Имя и фамилия обязательны" },
        { status: 400 },
      );
    }

    if (!email) {
      
      return NextResponse.json({ error: "Email обязателен" }, { status: 400 });
    }

    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    client = await pool.connect();

    // Проверка на существующего пользователя
    const existing = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (existing.rows.length > 0) {
      
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 400 },
      );
    }

    // Вставка пользователя
    const insertQuery = `
      INSERT INTO users (
        id, first_name, last_name, email, password, role, 
        department, manager, avatar, has_full_access, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *
    `;

    const insertValues = [
      id,
      firstName,
      lastName,
      email,
      password || null,
      role || "Сотрудник",
      department || null,
      manager || null,
      avatar || null,
      hasFullAccess || false,
    ];

    console.log("📝 Выполняем INSERT...");
    const result = await client.query(insertQuery, insertValues);

    const newUser = result.rows[0];
    

    return NextResponse.json(
      {
        id: newUser.id,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        manager: newUser.manager,
        avatar: newUser.avatar,
        hasFullAccess: newUser.has_full_access,
        createdAt: newUser.created_at,
        updatedAt: newUser.updated_at,
      },
      { status: 201 },
    );
  } catch (error) {
    const err = error as Error;
    
    return NextResponse.json(
      { error: "Ошибка добавления пользователя: " + err.message },
      { status: 500 },
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
