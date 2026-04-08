const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

async function migrate() {
  console.log('🚀 Начинаем миграцию базы данных...');
  
  try {
    // Читаем SQL файл
    const sqlPath = path.join(process.cwd(), 'sql', '01_create_users_table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Разбиваем на отдельные команды
    const commands = sqlContent.split(';').filter(cmd => cmd.trim());
    
    for (const command of commands) {
      if (command.trim()) {
        console.log('📝 Выполняем:', command.substring(0, 50) + '...');
        await sql.query(command);
      }
    }
    
    console.log('✅ Миграция успешно завершена!');
  } catch (error) {
    console.error('❌ Ошибка миграции:', error);
  }
}

migrate();