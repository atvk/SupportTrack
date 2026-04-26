import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getPoolConfig } from '../../lib/postgres';
import { ensureAdminUser, isAdminEmail, verifyPassword, hashPassword } from '../../lib/auth';

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

    client = await pool.connect();
    await ensureAdminUser(client);
    
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

    const storedPassword = user.password as string | null;
    if (!storedPassword) {
      return NextResponse.json(
        { message: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    let passwordValid = false;
    if (storedPassword.startsWith("$2")) {
      passwordValid = await verifyPassword(password, storedPassword);
    } else {
      // Legacy fallback: upgrade plain-text password to hash on successful login.
      passwordValid = storedPassword === password;
      if (passwordValid) {
        const upgradedHash = await hashPassword(password);
        await client.query("UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2", [
          upgradedHash,
          user.id,
        ]);
      }
    }

    if (!passwordValid) {
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
      hasFullAccess: Boolean(user.has_full_access) || isAdminEmail(user.email),
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