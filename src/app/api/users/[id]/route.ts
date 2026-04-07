import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'users.json');

function readUsers() {
  try {
    if (!fs.existsSync(dataPath)) {
      fs.writeFileSync(dataPath, JSON.stringify([], null, 2));
      return [];
    }
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Ошибка чтения файла:', error);
    return [];
  }
}

function writeUsers(users: any[]) {
  fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
}

// PUT – обновление пользователя
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id; // НЕ преобразуем в число!
    
    const updatedUser = await request.json();
    const users = readUsers();
    
    console.log('🔧 Редактирование пользователя с ID:', userId);
    console.log('📝 Новые данные:', updatedUser);
    console.log('📋 Доступные ID:', users.map((u: any) => u.id));
    
    // Сравниваем как строки
    const userIndex = users.findIndex((u: any) => String(u.id) === String(userId));
    
    if (userIndex === -1) {
      console.error('❌ Пользователь не найден. ID:', userId);
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }
    
    // Сохраняем id и createdAt, обновляем остальные поля
    users[userIndex] = {
      ...users[userIndex],
      ...updatedUser,
      id: userId,
      updatedAt: new Date().toISOString()
    };
    
    writeUsers(users);
    console.log('✅ Пользователь обновлен:', users[userIndex]);
    
    return NextResponse.json(users[userIndex]);
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json({ error: 'Ошибка обновления пользователя' }, { status: 500 });
  }
}

// DELETE – удаление пользователя
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id; // НЕ преобразуем в число!
    
    const users = readUsers();
    
    console.log('🗑️ Удаление пользователя с ID:', userId);
    console.log('📋 Доступные ID в файле:', users.map((u: any) => u.id));
    
    // Сравниваем как строки
    const userToDelete = users.find((u: any) => String(u.id) === String(userId));
    
    if (!userToDelete) {
      console.error('❌ Пользователь не найден для удаления. ID:', userId);
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }
    
    const filteredUsers = users.filter((u: any) => String(u.id) !== String(userId));
    writeUsers(filteredUsers);
    
    console.log('✅ Пользователь удален:', userToDelete.firstName, userToDelete.lastName);
    
    return NextResponse.json({ message: 'Пользователь удалён' });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: 'Ошибка удаления пользователя' }, { status: 500 });
  }
}