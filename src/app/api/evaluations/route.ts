import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET - получить все оценки
export async function GET() {
  try {
    const { rows } = await sql`
      SELECT e.*, 
             u1.first_name as specialist_first_name, u1.last_name as specialist_last_name,
             u2.first_name as inspector_first_name, u2.last_name as inspector_last_name,
             u3.first_name as supervisor_first_name, u3.last_name as supervisor_last_name
      FROM evaluations e
      LEFT JOIN users u1 ON e.specialist_id = u1.id
      LEFT JOIN users u2 ON e.inspector_id = u2.id
      LEFT JOIN users u3 ON e.supervisor_id = u3.id
      ORDER BY e.date DESC
    `;
    
    const evaluations = rows.map(row => ({
      ...row,
      specialist: row.specialist_id ? {
        id: row.specialist_id,
        firstName: row.specialist_first_name,
        lastName: row.specialist_last_name
      } : null,
      inspector: row.inspector_id ? {
        id: row.inspector_id,
        firstName: row.inspector_first_name,
        lastName: row.inspector_last_name
      } : null,
      supervisor: row.supervisor_id ? {
        id: row.supervisor_id,
        firstName: row.supervisor_first_name,
        lastName: row.supervisor_last_name
      } : null
    }));
    
    return NextResponse.json(evaluations);
  } catch (error) {
    console.error('GET Evaluations Error:', error);
    return NextResponse.json({ error: 'Ошибка загрузки оценок' }, { status: 500 });
  }
}

// POST - создать оценку
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = `${Date.now()}`;
    
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
      INSERT INTO evaluations (
        id, date, week, contact, specialist_id, supervisor_id, 
        topic, selected_errors, csi, inspector_id, comment, total_score, created_at
      ) VALUES (
        ${id}, ${date}, ${week}, ${contact}, ${specialistId}, ${supervisorId},
        ${topic}, ${JSON.stringify(selectedErrors)}::jsonb, ${csi}, ${inspectorId}, 
        ${comment}, ${totalScore}, NOW()
      )
    `;
    
    return NextResponse.json({ id, ...body }, { status: 201 });
  } catch (error) {
    console.error('POST Evaluation Error:', error);
    return NextResponse.json({ error: 'Ошибка создания оценки' }, { status: 500 });
  }
}