SupportTrack/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── login/
│   │   │       └── route.ts
│   │   ├── users/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   ├── admin/
│   │   └── page.tsx
│   ├── auth/
│   │   └── login/
│   │       └── page.tsx
│   ├── user/
│   │   └── [id]/
│   │       └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── UserTable.tsx
│   ├── AddEditUserPopup.tsx
│   ├── Director.tsx
│   ├── Employee.tsx
│   └── Specialist.tsx
├── types/
│   └── users.ts
├── styles/
│   └── globals.css
├── data/
│   └── users.json
├── globals.d.ts
└── package.json

## Docker запуск

1. (Опционально) скопируйте переменные окружения для Docker:

```bash
copy .env.docker.example .env
```

2. Запустите проект в контейнерах:

```bash
docker compose up --build
```

3. Откройте приложение: `http://localhost:3000`

PostgreSQL будет доступен на `localhost:5432`.

### Полезные команды

Остановить контейнеры:

```bash
docker compose down
```

Остановить и удалить том базы данных:

```bash
docker compose down -v
```