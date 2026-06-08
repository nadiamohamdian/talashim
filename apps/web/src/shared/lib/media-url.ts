import { webEnv } from '@/shared/config/env';

export function getMediaFileUrl(folder: string, filename: string): string {
  const base = webEnv.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, '');
  return `${base}/media-files/${folder}/${filename}`;
}
