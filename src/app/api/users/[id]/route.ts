import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Создаем пул соединений
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  
  try {
    const { id } = await params;
    console.log(`🔍 GET /api/users/${id}`);
    
    client = await pool.connect();
    const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }
    
    const user = result.rows[0];
    
    return NextResponse.json({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      department: user.department,
      manager: user.manager,
      avatar: user.avatar,
      hasFullAccess: user.has_full_access,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });
  } catch (error) {
    const err = error as Error;
    console.error('❌ GET Error:', err.message);
    return NextResponse.json(
      { error: 'Ошибка загрузки пользователя: ' + err.message },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log(`✏️ PUT /api/users/${id}`);
    console.log('📦 Данные для обновления:', JSON.stringify(body, null, 2));
    
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
    
    client = await pool.connect();
    
    // Проверяем существование
    const checkResult = await client.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }
    
    // Обновляем пользователя
    const result = await client.query(
      `UPDATE users SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        email = COALESCE($3, email),
        password = CASE WHEN $4 IS NOT NULL AND $4 != '' THEN $4 ELSE password END,
        role = COALESCE($5, role),
        department = COALESCE($6, department),
        manager = COALESCE($7, manager),
        avatar = COALESCE($8, avatar),
        has_full_access = COALESCE($9, has_full_access),
        updated_at = NOW()
      WHERE id = $10
      RETURNING *`,
      [firstName, lastName, email, password, role, department, manager, avatar, hasFullAccess, id]
    );
    
    const updatedUser = result.rows[0];
    
    console.log('✅ Пользователь обновлен, avatar:', updatedUser.avatar ? 'есть' : 'нет');
    
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
      updatedAt: updatedUser.updated_at
    });
    
  } catch (error) {
    const err = error as Error;
    console.error('❌ PUT Error:', err.message);
    return NextResponse.json(
      { error: 'Ошибка обновления пользователя: ' + err.message },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  
  try {
    const { id } = await params;
    console.log(`🗑️ DELETE /api/users/${id}`);
    
    client = await pool.connect();
    const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Пользователь успешно удалён' });
  } catch (error) {
    const err = error as Error;
    console.error('❌ DELETE Error:', err.message);
    return NextResponse.json(
      { error: 'Ошибка удаления пользователя: ' + err.message },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}