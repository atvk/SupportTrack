import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

const readUsers = () => {
  try {
    if (!fs.existsSync(usersFilePath)) return [];
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    const users = readUsers();
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json(
        { message: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    const { password: _, ...safeUser } = user;
    
    // Создаём ответ с пользователем
    const response = NextResponse.json(safeUser);
    
    // ✅ Храним в куке ТОЛЬКО ID и роль (не весь объект!)
    const sessionData = {
      id: safeUser.id,
      role: safeUser.role,
    };
    
    response.cookies.set('session', JSON.stringify(sessionData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 дней
    });
    
    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { message: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}