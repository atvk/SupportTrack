-- Создаем таблицу пользователей
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
);

-- Создаем таблицу оценок
CREATE TABLE IF NOT EXISTS evaluations (
  id VARCHAR(255) PRIMARY KEY,
  date DATE NOT NULL,
  week INTEGER NOT NULL,
  contact TEXT,
  specialist_id VARCHAR(255) NOT NULL,
  supervisor_id VARCHAR(255),
  topic VARCHAR(255),
  selected_errors JSONB NOT NULL,
  csi INTEGER NOT NULL,
  inspector_id VARCHAR(255) NOT NULL,
  comment TEXT,
  total_score INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Внешние ключи
  FOREIGN KEY (specialist_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (inspector_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_evaluations_specialist ON evaluations(specialist_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_inspector ON evaluations(inspector_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_date ON evaluations(date);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);