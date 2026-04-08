DROP TABLE IF EXISTS users;

-- Создаем таблицу пользователей
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  role VARCHAR(255) DEFAULT 'Сотрудник',
  department VARCHAR(255),
  avatar TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создаем индекс для быстрого поиска по email
CREATE INDEX idx_users_email ON users(email);

-- Добавляем тестового пользователя (опционально)
INSERT INTO users (id, first_name, last_name, email, role, department, has_full_access, created_at, updated_at)
VALUES (
  'user_test_1',
  'Администратор',
  'Системы',
  'admin@supporttrack.com',
  'Админ',
  'IT',
  TRUE,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;