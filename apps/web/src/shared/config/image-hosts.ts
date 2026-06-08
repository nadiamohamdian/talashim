/** Hostnames allowed for next/image optimization (also used by StoreImage). */
export const DEFAULT_IMAGE_REMOTE_HOSTS = ['zivazz.com'] as const;

/** Local API / media server hostnames used in development. */
export const LOCAL_DEV_IMAGE_HOSTS = ['localhost', '127.0.0.1'] as const;

export function getImageRemoteHosts(): string[] {
  const fromEnv =
    process.env.NEXT_PUBLIC_IMAGE_REMOTE_HOSTS?.split(',')
      .map((entry) => entry.trim())
      .filter(Boolean) ?? [];

  const hosts = new Set<string>([...DEFAULT_IMAGE_REMOTE_HOSTS, ...fromEnv]);

  if (process.env.NODE_ENV !== 'production') {
    for (const host of LOCAL_DEV_IMAGE_HOSTS) {
      hosts.add(host);
    }
  }

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (apiBase) {
    try {
      hosts.add(new URL(apiBase).hostname);
    } catch {
      // ignore invalid API URL
    }
  }

  return [...hosts];
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
