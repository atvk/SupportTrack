import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET - получить всех пользователей
export async function GET() {
  try {
    console.log('📖 GET /api/users');
    
    const { rows } = await sql`
      SELECT * FROM users ORDER BY created_at DESC
    `;
    
    console.log(`✅ Загружено ${rows.length} пользователей`);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { error: 'Ошибка загрузки пользователей' },
      { status: 500 }
    );
  }
}

// POST - создать пользователя
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('📝 Создание пользователя:', body.email);
    
    const {
      firstName,
      lastName,
      email,
      password,
      role = 'Сотрудник',
      department,
      manager,
      avatar,
      hasFullAccess = false
    } = body;
    
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Проверка на существующего пользователя
    const { rows: existing } = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;
    
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }
    
    const { rows } = await sql`
      INSERT INTO users (
        id, first_name, last_name, email, password, role, 
        department, manager, avatar, has_full_access, created_at, updated_at
      ) VALUES (
        ${id}, ${firstName}, ${lastName}, ${email}, ${password || null}, ${role},
        ${department || null}, ${manager || null}, ${avatar || null}, ${hasFullAccess}, 
        NOW(), NOW()
      )
      RETURNING *
    `;
    
    console.log('✅ Пользователь создан:', id);
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json(
      { error: 'Ошибка добавления пользователя' },
      { status: 500 }
    );
  }
}