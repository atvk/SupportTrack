import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getPoolConfig } from '@/app/lib/postgres';

// Создаем пул соединений с базой данных
const pool = new Pool({
  ...getPoolConfig(),
});

export async function POST(request: NextRequest) {
  let client;
  
  try {
    const { email, password } = await request.json();

    console.log(`🔐 Попытка входа: ${email}`);

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    // Подключаемся к базе данных на Vercel
    client = await pool.connect();
    
    // Ищем пользователя в БД (не в файле!)
    const result = await client.query(
      `SELECT id, first_name, last_name, email, password, role, department, 
              manager, avatar, has_full_access, created_at, updated_at
       FROM users 
       WHERE email = $1`,
      [email]
    );
    
    const user = result.rows[0];

    if (!user) {
      console.log(`❌ Пользователь не найден в БД: ${email}`);
      return NextResponse.json(
        { message: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Проверка пароля (сравниваем с тем, что в БД)
    if (user.password !== password) {
      console.log(`❌ Неверный пароль для: ${email}`);
      return NextResponse.json(
        { message: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    console.log(`✅ Успешный вход: ${email} из БД`);

    // Формируем безопасный объект пользователя (без пароля)
    const safeUser = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      department: user.department,
      manager: user.manager,
      avatar: user.avatar,
      hasFullAccess: user.has_full_access,
    };
    
    // Создаём ответ с пользователем
    const response = NextResponse.json(safeUser);
    
    // Храним в куке ID и роль
    const sessionData = {
      id: safeUser.id,
      role: safeUser.role,
      email: safeUser.email,
    };
    
    response.cookies.set('session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 дней
    });
    
    return response;
    
  } catch (error) {
    const err = error as Error;
    console.error('❌ Auth error:', err.message);
    return NextResponse.json(
      { message: 'Ошибка сервера при авторизации' },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}