import { compare, hash } from "bcryptjs";
import { NextRequest } from "next/server";
import { PoolClient } from "pg";

export interface SessionData {
  id: string;
  role?: string;
  email?: string;
}

const DEFAULT_ADMIN_EMAIL = "steblovskiyanton@gmail.com";
const DEFAULT_ADMIN_PASSWORD = ["Atvk", "041085!"].join("");
const BCRYPT_ROUNDS = 12;

export function getAdminEmail() {
  return (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).toLowerCase();
}

function getAdminSeedPassword() {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  return email.toLowerCase() === getAdminEmail();
}

export function isAdminSession(session?: SessionData | null) {
  if (!session) return false;
  return isAdminEmail(session.email);
}

export function readSession(request: NextRequest): SessionData | null {
  const cookie = request.cookies.get("session");
  if (!cookie?.value) {
    return null;
  }

  try {
    const parsed = JSON.parse(cookie.value) as SessionData;
    if (!parsed?.id) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  return hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, storedHash: string) {
  return compare(password, storedHash);
}

export function validatePasswordPolicy(password: string) {
  const uppercase = (password.match(/[A-Z]/g) || []).length;
  const lowercase = (password.match(/[a-z]/g) || []).length;
  const digits = (password.match(/[0-9]/g) || []).length;
  const special = (password.match(/[^A-Za-z0-9]/g) || []).length;

  if (uppercase < 1) {
    return { valid: false, message: "Пароль должен содержать минимум 1 заглавную букву" };
  }
  if (lowercase < 4) {
    return { valid: false, message: "Пароль должен содержать более 3 строчных букв" };
  }
  if (digits < 5) {
    return { valid: false, message: "Пароль должен содержать более 4 цифр" };
  }
  if (special < 1) {
    return { valid: false, message: "Пароль должен содержать минимум 1 спецсимвол" };
  }

  return { valid: true };
}

export async function ensureAdminUser(client: PoolClient) {
  const adminEmail = getAdminEmail();
  const seedPassword = getAdminSeedPassword();
  const hashedSeedPassword = await hashPassword(seedPassword);

  const existing = await client.query(
    `SELECT id, password
     FROM users
     WHERE LOWER(email) = LOWER($1)
     LIMIT 1`,
    [adminEmail],
  );

  if (existing.rows.length === 0) {
    await client.query(
      `INSERT INTO users (
        id, first_name, last_name, email, password, role,
        department, manager, avatar, has_full_access, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
      [
        "admin_root",
        "Anton",
        "Steblovskiy",
        adminEmail,
        hashedSeedPassword,
        "Админ",
        "Администрация",
        null,
        null,
        true,
      ],
    );
    return;
  }

  const currentPassword = existing.rows[0].password as string | null;
  const isAlreadyHashed = typeof currentPassword === "string" && currentPassword.startsWith("$2");
  if (!isAlreadyHashed) {
    await client.query(
      "UPDATE users SET password = $1, role = $2, has_full_access = $3, updated_at = NOW() WHERE id = $4",
      [hashedSeedPassword, "Админ", true, existing.rows[0].id],
    );
  }
}
