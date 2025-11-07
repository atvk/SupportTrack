export const ROUTES = {
  // Главная
  HOME: "/",
  DIRECTOR: "/director",
  SPECIALIST: "/specialist",
  EMPLOYEE: "/employee",
  // Социальные сети

  // Внешние отзывики
} as const;

export type RouteKey = keyof typeof ROUTES;
