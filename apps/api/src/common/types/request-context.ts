import type { Request } from 'express';

export const REQUEST_ID_HEADER = 'x-request-id';

export type RequestWithContext = Request & {
  requestId?: string;
  route?: { path?: string };
};

export function getRequestId(request: RequestWithContext): string | undefined {
  return request.requestId;
}

export function getRoutePath(request: RequestWithContext): string {
  return request.route?.path ?? request.path ?? request.url;
}
