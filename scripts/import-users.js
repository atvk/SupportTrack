require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Используем DATABASE_URL (он у вас точно есть)
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

console.log('🚀 Начинаем импорт пользователей...');

if (!connectionString) {
  console.error('❌ Ошибка: DATABASE_URL не найден');
  process.exit(1);
}

console.log('✅ DATABASE_URL найден');

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

async function importUsers() {
  try {
    await client.connect();
    console.log('✅ Подключение к базе данных установлено');
    
    // Создаем таблицу пользователей
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255),
        role VARCHAR(255) DEFAULT 'Сотрудник',
        department VARCHAR(255),
        manager VARCHAR(255),
        avatar TEXT,
        has_full_access BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Таблица users создана/проверена');
    
    // Читаем users.json
    const usersPath = path.join(process.cwd(), 'data', 'users.json');
    
    if (!fs.existsSync(usersPath)) {
      console.error(`❌ Файл ${usersPath} не найден`);
      return;
    }
    
    const usersData = fs.readFileSync(usersPath, 'utf8');
    const users = JSON.parse(usersData);
    
    console.log(`📖 Найдено ${users.length} пользователей в файле`);
    
    let added = 0;
    let skipped = 0;
    
    for (const user of users) {
      try {
        // Проверяем существование
        const result = await client.query(
          'SELECT id FROM users WHERE email = $1',
          [user.email]
        );
        
        if (result.rows.length === 0) {
          await client.query(
            `INSERT INTO users (
              id, first_name, last_name, email, password, role, 
              department, manager, avatar, has_full_access, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11, NOW()), COALESCE($12, NOW()))`,
            [
              user.id,
              user.firstName || user.first_name,
              user.lastName || user.last_name,
              user.email,
              user.password || null,
              user.role || 'Сотрудник',
              user.department || null,
              user.manager || null,
              user.avatar || null,
              user.hasFullAccess || user.has_full_access || false,
              user.createdAt || null,
              user.updatedAt || null
            ]
          );
          console.log(`✅ Добавлен: ${user.firstName || user.first_name} ${user.lastName || user.last_name} (${user.email})`);
          added++;
        } else {
          console.log(`⚠️ Уже существует: ${user.email}`);
          skipped++;
        }
      } catch (error) {
        console.error(`❌ Ошибка при добавлении ${user.email}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Импорт завершен! Добавлено: ${added}, Пропущено: ${skipped}`);
    
    // Показываем результат
    const result = await client.query('SELECT id, first_name, last_name, email, role FROM users ORDER BY created_at DESC');
    console.log('\n📋 Пользователи в базе данных:');
    result.rows.forEach(user => {
      console.log(`   - ${user.first_name} ${user.last_name} (${user.email}) - ${user.role || 'Нет роли'}`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error('Детали:', error);
  } finally {
    await client.end();
  }
}

importUsers();