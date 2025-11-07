import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

const readUsers = () => {
  try {
    if (!fs.existsSync(usersFilePath)) {
      return [];
    }
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

export async function POST(request: NextRequest) {
  try {
    const { login, password } = await request.json();

    if (!login || !password) {
      return NextResponse.json(
        { message: 'Логин и пароль обязательны' },
        { status: 400 }
      );
    }

    const users = readUsers();
    
    // Ищем пользователя по логину и паролю
    const user = users.find((u: any) => u.login === login && u.password === password);

    if (!user) {
      return NextResponse.json(
        { message: 'Неверный логин или пароль' },
        { status: 401 }
      );
    }

    // Возвращаем пользователя без пароля
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}