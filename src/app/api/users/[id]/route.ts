import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - получить одного пользователя
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('❌ GET Error:', error);
    return NextResponse.json(
      { error: 'Ошибка загрузки пользователя' },
      { status: 500 }
    );
  }
}

// PUT - обновить пользователя
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const body = await request.json();
    
    console.log(`✏️ Обновление пользователя ${userId}`);
    
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      department,
      avatar,
    } = body;
    
    // Проверяем существование пользователя
    const existing = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }
    
    // Подготавливаем данные для обновления
    const updateData: any = {
      updatedAt: new Date()
    };
    
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (password !== undefined && password !== '') updateData.password = password;
    if (role !== undefined) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (avatar !== undefined) updateData.avatar = avatar;
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });
    
    console.log('✅ Пользователь обновлен');
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('❌ PUT Error:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления пользователя' },
      { status: 500 }
    );
  }
}

// DELETE - удалить пользователя
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    console.log(`🗑️ Удаление пользователя ${userId}`);
    
    await prisma.user.delete({
      where: { id: userId }
    });
    
    console.log('✅ Пользователь удален');
    return NextResponse.json({ message: 'Пользователь успешно удалён' });
  } catch (error) {
    console.error('❌ DELETE Error:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления пользователя' },
      { status: 500 }
    );
  }
}