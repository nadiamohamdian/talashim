import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

interface RevalidateBody {
  path?: string;
  tag?: string;
}

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, message: 'Revalidation is not configured' }, { status: 503 });
  }

  const headerSecret = request.headers.get('x-revalidate-secret');
  if (headerSecret !== secret) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }

  let body: RevalidateBody = {};
  try {
    body = (await request.json()) as RevalidateBody;
  } catch {
    body = {};
  }

  if (body.tag) {
    revalidateTag(body.tag, 'max');
  }
  if (body.path) {
    revalidatePath(body.path);
  }

  return NextResponse.json({
    ok: true,
    revalidated: {
      path: body.path ?? null,
      tag: body.tag ?? null,
    },
  });
}
