import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

const ensureDataDirectory = () => {
  const dataDir = path.dirname(usersFilePath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

const readUsers = () => {
  try {
    ensureDataDirectory();
    if (!fs.existsSync(usersFilePath)) {
      return [];
    }
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeUsers = (users: any[]) => {
  ensureDataDirectory();
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// Функция для проверки размера base64 изображения
const getBase64Size = (base64String: string) => {
  if (!base64String) return 0;
  // Base64 занимает примерно 4/3 от размера исходного файла
  return (base64String.length * 3) / 4;
};

export async function POST(request: NextRequest) {
  try {
    const { role, login, password, firstName, lastName, avatar } = await request.json();

    if (!role || !login || !password || !firstName || !lastName) {
      return NextResponse.json(
        { message: 'Все поля обязательны для заполнения' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(login)) {
      return NextResponse.json(
        { message: 'Введите корректный email адрес' },
        { status: 400 }
      );
    }

    // Проверка размера аватара (2 МБ = 2 * 1024 * 1024 байт)
    if (avatar && getBase64Size(avatar) > 2 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'Размер фотографии не должен превышать 2 МБ' },
        { status: 400 }
      );
    }

    const users = readUsers();

    const existingUser = users.find((user: any) => user.login === login);
    if (existingUser) {
      return NextResponse.json(
        { message: 'Пользователь с таким email уже существует' },
        { status: 409 }
      );
    }

    const newUser = {
      id: `user_${Date.now()}`,
      role,
      login,
      password,
      firstName,
      lastName,
      avatar: avatar || null,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeUsers(users);

    return NextResponse.json(
      { message: 'Пользователь успешно создан', user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const users = readUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error reading users:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}