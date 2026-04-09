import { NextResponse } from 'next/server';
import { query } from '@/src/app/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`🔍 GET /api/users/${id}`);
    
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    
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
    console.log('Данные:', JSON.stringify(body, null, 2));
    
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    client = await pool.connect();
    
    // Проверяем существование
    const checkResult = await client.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      await client.release();
      await pool.end();
      return NextResponse.json(
        { error: `Пользователь с ID ${id} не найден` },
        { status: 404 }
      );
    }
    
    // Простое обновление для теста
    const { firstName, lastName, email, role, department } = body;
    
    const result = await client.query(
      `UPDATE users 
       SET first_name = $1, 
           last_name = $2, 
           email = $3, 
           role = $4, 
           department = $5,
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [firstName, lastName, email, role, department, id]
    );
    
    await client.release();
    await pool.end();
    
    const updatedUser = result.rows[0];
    
    console.log('✅ Обновлено:', updatedUser);
    
    return NextResponse.json({
      id: updatedUser.id,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      email: updatedUser.email,
      role: updatedUser.role,
      department: updatedUser.department,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at
    });
    
  } catch (error) {
    const err = error as Error;
    console.error('❌ PUT Error:', err.message);
    console.error('Stack:', err.stack);
    
    if (client) {
      await client.release().catch(console.error);
    }
    
    return NextResponse.json(
      { error: 'Ошибка обновления: ' + err.message },
      { status: 500 }
    );
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`🗑️ DELETE /api/users/${id}`);
    
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }
    
    console.log(`✅ Пользователь удален: ${id}`);
    
    return NextResponse.json({ message: 'Пользователь успешно удалён' });
  } catch (error) {
    const err = error as Error;
    console.error('❌ DELETE Error:', err.message);
    return NextResponse.json(
      { error: 'Ошибка удаления пользователя: ' + err.message },
      { status: 500 }
    );
  }
}