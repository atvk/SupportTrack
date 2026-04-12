import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

// GET - получить все оценки
export async function GET() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM evaluations ORDER BY date DESC, created_at DESC'
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('GET Evaluations Error:', error);
    return NextResponse.json({ error: 'Ошибка загрузки оценок' }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}

// POST - создать новую оценку
export async function POST(request: Request) {
  let client;
  try {
    const body = await request.json();
    console.log('📝 Создание оценки:', body);
    
    const id = `${Date.now()}`;
    
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
      `INSERT INTO evaluations (
        id, date, week, contact, specialist, supervisor, 
        topic, selected_errors, csi, inspector, comment, total_score, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      RETURNING *`,
      [
        id, date, week, contact, specialist, supervisor || null,
        topic, JSON.stringify(selectedErrors), csi || 0, inspector, 
        comment || null, totalScore
      ]
    );
    
    console.log('✅ Оценка создана:', id);
    return NextResponse.json(result.rows[0], { status: 201 });
    
  } catch (error) {
    console.error('POST Evaluation Error:', error);
    return NextResponse.json(
      { error: 'Ошибка создания оценки: ' + (error as Error).message },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}