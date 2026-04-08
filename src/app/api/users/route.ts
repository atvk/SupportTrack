import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - получить всех пользователей
export async function GET() {
  try {
    console.log('📖 GET /api/users');
    
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`✅ Загружено ${users.length} пользователей`);
    return NextResponse.json(users);
  } catch (error) {
    console.error('❌ GET Error:', error);
    return NextResponse.json(
      { error: 'Ошибка загрузки пользователей' },
      { status: 500 }
    );
  }
}

// POST - создать пользователя
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('📝 Создание пользователя:', body.email);
    
    const {
      firstName,
      lastName,
      email,
      password,
      role = 'Сотрудник',
      department,
      avatar,
    } = body;
    
    // Проверка на существующего пользователя
    const existing = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existing) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }
    
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password,
        role,
        department,
        avatar,
      }
    });
    
    console.log('✅ Пользователь создан:', newUser.id);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json(
      { error: 'Ошибка добавления пользователя' },
      { status: 500 }
    );
  }
}