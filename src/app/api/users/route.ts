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

// Генерация строкового ID
function generateId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function GET() {
  try {
    const users = readUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: 'Ошибка загрузки пользователей' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newUser = await request.json();
    const users = readUsers();
    
    const userToAdd = {
      id: generateId(), // Строковый ID
      ...newUser,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    users.push(userToAdd);
    writeUsers(users);
    
    return NextResponse.json(userToAdd, { status: 201 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: 'Ошибка добавления пользователя' }, { status: 500 });
  }
}