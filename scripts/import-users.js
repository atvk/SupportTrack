const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

async function importUsers() {
  console.log('🚀 Начинаем импорт пользователей...');
  
  try {
    // Читаем файл users.json
    const usersPath = path.join(process.cwd(), 'data', 'users.json');
    const usersData = fs.readFileSync(usersPath, 'utf8');
    const users = JSON.parse(usersData);
    
    console.log(`📖 Найдено ${users.length} пользователей в файле`);
    
    for (const user of users) {
      try {
        // Проверяем, существует ли пользователь
        const { rows: existing } = await sql`
          SELECT id FROM users WHERE id = ${user.id}
        `;
        
        if (existing.length === 0) {
          // Добавляем пользователя
          await sql`
            INSERT INTO users (
              id, first_name, last_name, email, password, role, 
              department, manager, avatar, has_full_access, created_at, updated_at
            ) VALUES (
              ${user.id}, 
              ${user.firstName || user.first_name}, 
              ${user.lastName || user.last_name}, 
              ${user.email}, 
              ${user.password || null}, 
              ${user.role || 'Сотрудник'},
              ${user.department || null},
              ${user.manager || null},
              ${user.avatar || null},
              ${user.hasFullAccess || user.has_full_access || false},
              ${user.createdAt || new Date().toISOString()},
              ${user.updatedAt || new Date().toISOString()}
            )
          `;
          console.log(`✅ Добавлен: ${user.firstName} ${user.lastName} (${user.email})`);
        } else {
          console.log(`⚠️ Пользователь уже существует: ${user.email}`);
        }
      } catch (error) {
        console.error(`❌ Ошибка при добавлении ${user.email}:`, error.message);
      }
    }
    
    console.log('🎉 Импорт завершен!');
    
    // Показываем всех пользователей в базе
    const { rows: allUsers } = await sql`
      SELECT id, first_name, last_name, email, role FROM users ORDER BY created_at DESC
    `;
    console.log('\n📋 Пользователи в базе данных:');
    allUsers.forEach(user => {
      console.log(`   - ${user.first_name} ${user.last_name} (${user.email}) - ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка импорта:', error);
  }
}

importUsers();