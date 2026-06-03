import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

/** Auth pages only — checkout auth is enforced client-side via ProtectedShell. */
export const config = {
  matcher: ['/login', '/login/:path*'],
};
