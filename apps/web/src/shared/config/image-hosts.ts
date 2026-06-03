/** Hostnames allowed for next/image optimization (also used by StoreImage). */
export const DEFAULT_IMAGE_REMOTE_HOSTS = [
  'images.unsplash.com',
  'zivazz.com',
] as const;

export function getImageRemoteHosts(): string[] {
  const fromEnv =
    process.env.NEXT_PUBLIC_IMAGE_REMOTE_HOSTS?.split(',')
      .map((entry) => entry.trim())
      .filter(Boolean) ?? [];

  return [...new Set([...DEFAULT_IMAGE_REMOTE_HOSTS, ...fromEnv])];
}

export function isNextImageHostAllowed(src: string, hosts = getImageRemoteHosts()): boolean {
  if (src.startsWith('/')) {
    return true;
  }

  try {
    const { hostname, protocol } = new URL(src);
    if (protocol !== 'https:' && protocol !== 'http:') {
      return false;
    }
    return hosts.includes(hostname);
  } catch {
    return false;
  }
}

export function buildImageRemotePatterns(hosts = getImageRemoteHosts()) {
  return hosts.flatMap((hostname) => [
    { protocol: 'https' as const, hostname },
    { protocol: 'http' as const, hostname },
  ]);
}
