import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET - получить одного пользователя
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { rows } = await sql`
      SELECT * FROM users WHERE id = ${id}
    `;
    
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { error: 'Ошибка загрузки пользователя' },
      { status: 500 }
    );
  }
}

// PUT - обновить пользователя
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log(`✏️ Обновление пользователя ${id}`);
    
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      department,
      manager,
      avatar,
      hasFullAccess
    } = body;
    
    // Проверяем существование пользователя
    const { rows: existing } = await sql`
      SELECT id FROM users WHERE id = ${id}
    `;
    
    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }
    
    // Динамически строим UPDATE запрос
    const updates = [];
    const values = [];
    let paramCounter = 1;
    
    if (firstName !== undefined) {
      updates.push(`first_name = $${paramCounter++}`);
      values.push(firstName);
    }
    if (lastName !== undefined) {
      updates.push(`last_name = $${paramCounter++}`);
      values.push(lastName);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramCounter++}`);
      values.push(email);
    }
    if (password !== undefined && password !== '') {
      updates.push(`password = $${paramCounter++}`);
      values.push(password);
    }
    if (role !== undefined) {
      updates.push(`role = $${paramCounter++}`);
      values.push(role);
    }
    if (department !== undefined) {
      updates.push(`department = $${paramCounter++}`);
      values.push(department);
    }
    if (manager !== undefined) {
      updates.push(`manager = $${paramCounter++}`);
      values.push(manager);
    }
    if (avatar !== undefined) {
      updates.push(`avatar = $${paramCounter++}`);
      values.push(avatar);
    }
    if (hasFullAccess !== undefined) {
      updates.push(`has_full_access = $${paramCounter++}`);
      values.push(hasFullAccess);
    }
    
    updates.push(`updated_at = NOW()`);
    values.push(id);
    
    const query = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCounter}
      RETURNING *
    `;
    
    const { rows } = await sql.query(query, values);
    
    console.log('✅ Пользователь обновлен');
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления пользователя' },
      { status: 500 }
    );
  }
}

// DELETE - удалить пользователя
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log(`🗑️ Удаление пользователя ${id}`);
    
    const { rowCount } = await sql`
      DELETE FROM users WHERE id = ${id}
    `;
    
    if (rowCount === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }
    
    console.log('✅ Пользователь удален');
    return NextResponse.json({ message: 'Пользователь успешно удалён' });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления пользователя' },
      { status: 500 }
    );
  }
}