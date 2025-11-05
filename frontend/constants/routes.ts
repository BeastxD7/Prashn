// Central list of protected route prefixes used by middleware and client guards.
export const protectedRoutePrefixes: string[] = [];

export function isProtectedPath(path: string) {
  return false;
}

export const publicRoutes = [
  '/',
  '/about',
  '/auth',
  '/login',
  '/register',
];
