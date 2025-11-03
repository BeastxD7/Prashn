// Central list of protected route prefixes used by middleware and client guards.
export const protectedRoutePrefixes: string[] = [
  '/dashboard',
  '/generate',
  '/account',
  '/profile',
  '/quiz',
];

export function isProtectedPath(path: string) {
  return protectedRoutePrefixes.some((p) => path === p || path.startsWith(p + '/'));
}

export const publicRoutes = [
  '/',
  '/about',
  '/auth',
  '/login',
  '/register',
];
