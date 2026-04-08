import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET - получить одного пользователя
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`📖 GET /api/users/${id}`);
    
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
    console.error('❌ GET Error:', error);
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
    
    console.log(`✏️ PUT /api/users/${id}`);
    console.log('📝 Данные для обновления:', body);
    
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
    
    // Обновляем пользователя
    await sql`
      UPDATE users SET
        first_name = COALESCE(${firstName}, first_name),
        last_name = COALESCE(${lastName}, last_name),
        email = COALESCE(${email}, email),
        password = CASE WHEN ${password} IS NOT NULL AND ${password} != '' THEN ${password} ELSE password END,
        role = COALESCE(${role}, role),
        department = COALESCE(${department}, department),
        manager = COALESCE(${manager}, manager),
        avatar = COALESCE(${avatar}, avatar),
        has_full_access = COALESCE(${hasFullAccess}, has_full_access),
        updated_at = NOW()
      WHERE id = ${id}
    `;
    
    const { rows: updatedUser } = await sql`
      SELECT * FROM users WHERE id = ${id}
    `;
    
    console.log('✅ Пользователь обновлен');
    return NextResponse.json(updatedUser[0]);
  } catch (error) {
    console.error('❌ PUT Error:', error);
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
    console.log(`🗑️ DELETE /api/users/${id}`);
    
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
    console.error('❌ DELETE Error:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления пользователя' },
      { status: 500 }
    );
  }
}