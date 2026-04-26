import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getPoolConfig } from '../../../lib/postgres';

const pool = new Pool({
  ...getPoolConfig(),
});

// GET - получить оценку по ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  try {
    const { id } = await params;
    client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM evaluations WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Оценка не найдена' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('GET Evaluation Error:', error);
    return NextResponse.json({ error: 'Ошибка загрузки оценки' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}

// PUT - обновить оценку
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      date,
      week,
      contact,
      specialist,
      supervisor,
      topic,
      selectedErrors,
      csi,
      inspector,
      comment,
      totalScore
    } = body;
    
    client = await pool.connect();
    
    const result = await client.query(
      `UPDATE evaluations SET
        date = $1,
        week = $2,
        contact = $3,
        specialist = $4,
        supervisor = $5,
        topic = $6,
        selected_errors = $7,
        csi = $8,
        inspector = $9,
        comment = $10,
        total_score = $11
      WHERE id = $12
      RETURNING *`,
      [
        date, week, contact, specialist, supervisor || null,
        topic, JSON.stringify(selectedErrors), csi || 0, inspector,
        comment || null, totalScore, id
      ]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Оценка не найдена' }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('PUT Evaluation Error:', error);
    return NextResponse.json({ error: 'Ошибка обновления оценки' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}

// DELETE - удалить оценку
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let client;
  try {
    const { id } = await params;
    client = await pool.connect();
    const result = await client.query(
      'DELETE FROM evaluations WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Оценка не найдена' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Оценка удалена' });
  } catch (error) {
    console.error('DELETE Evaluation Error:', error);
    return NextResponse.json({ error: 'Ошибка удаления оценки' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}