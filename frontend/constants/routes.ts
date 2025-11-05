// Central list of protected route prefixes used by middleware and client guards.
export const protectedRoutePrefixes: string[] = ['/dashboard'];

export function isProtectedPath(path: string) {
  return protectedRoutePrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export const publicRoutes = [
  '/',
  '/about',
  '/auth',
  '/login',
  '/register',
];
