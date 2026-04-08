import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET - получить оценку по ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { rows } = await sql`
      SELECT * FROM evaluations WHERE id = ${id}
    `;
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Оценка не найдена' }, { status: 404 });
    }
    
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('GET Evaluation Error:', error);
    return NextResponse.json({ error: 'Ошибка загрузки оценки' }, { status: 500 });
  }
}

// PUT - обновить оценку
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      date,
      week,
      contact,
      specialistId,
      supervisorId,
      topic,
      selectedErrors,
      csi,
      inspectorId,
      comment,
      totalScore
    } = body;
    
    await sql`
      UPDATE evaluations SET
        date = ${date},
        week = ${week},
        contact = ${contact},
        specialist_id = ${specialistId},
        supervisor_id = ${supervisorId},
        topic = ${topic},
        selected_errors = ${JSON.stringify(selectedErrors)}::jsonb,
        csi = ${csi},
        inspector_id = ${inspectorId},
        comment = ${comment},
        total_score = ${totalScore}
      WHERE id = ${id}
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT Evaluation Error:', error);
    return NextResponse.json({ error: 'Ошибка обновления оценки' }, { status: 500 });
  }
}

// DELETE - удалить оценку
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await sql`DELETE FROM evaluations WHERE id = ${id}`;
    
    return NextResponse.json({ message: 'Оценка удалена' });
  } catch (error) {
    console.error('DELETE Evaluation Error:', error);
    return NextResponse.json({ error: 'Ошибка удаления оценки' }, { status: 500 });
  }
}