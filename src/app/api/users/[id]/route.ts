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

const writeUsers = (users: any[]) => {
  const dataDir = path.dirname(usersFilePath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

// Функция для проверки размера base64 изображения
const getBase64Size = (base64String: string) => {
  if (!base64String) return 0;
  return (base64String.length * 3) / 4;
};

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updatedData = await request.json();

    // Проверка размера аватара
    if (updatedData.avatar && getBase64Size(updatedData.avatar) > 2 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'Размер фотографии не должен превышать 2 МБ' },
        { status: 400 }
      );
    }

    const users = readUsers();
    const userIndex = users.findIndex((user: any) => user.id === id);

    if (userIndex === -1) {
      return NextResponse.json(
        { message: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updatedData,
      id: users[userIndex].id,
    };

    writeUsers(users);

    return NextResponse.json(users[userIndex]);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const users = readUsers();
    const userIndex = users.findIndex((user: any) => user.id === id);

    if (userIndex === -1) {
      return NextResponse.json(
        { message: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    const deletedUser = users.splice(userIndex, 1)[0];
    writeUsers(users);

    return NextResponse.json(deletedUser);
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}