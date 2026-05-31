import {
  AUTH_ROUTE_PREFIXES,
  PROTECTED_ROUTE_PREFIXES,
  PUBLIC_ROUTE_PREFIXES,
} from './routes.config';

function matchesPrefix(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some(
    (prefix) =>
      pathname === prefix || (prefix !== '/' && pathname.startsWith(`${prefix}/`)),
  );
}

export function isProtectedPath(pathname: string): boolean {
  return matchesPrefix(pathname, PROTECTED_ROUTE_PREFIXES);
}

export function isAuthPath(pathname: string): boolean {
  return matchesPrefix(pathname, AUTH_ROUTE_PREFIXES);
}

export function isPublicPath(pathname: string): boolean {
  return matchesPrefix(pathname, PUBLIC_ROUTE_PREFIXES);
}
