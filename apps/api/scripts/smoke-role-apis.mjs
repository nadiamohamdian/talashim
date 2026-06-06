#!/usr/bin/env node
/**
 * Smoke-test login + role-scoped API probes for all dev seed accounts.
 * Usage: pnpm --filter @sadafgold/api smoke:roles
 */

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:4000/api/v1';

const ACCOUNTS = [
  { role: 'SUPER_ADMIN', email: 'admin@talashim.local', password: 'Admin12345!' },
  { role: 'SUPPORT', email: 'support@talashim.local', password: 'Admin12345!' },
  { role: 'ACCOUNTANT', email: 'accountant@talashim.local', password: 'Admin12345!' },
  { role: 'EDITOR', email: 'editor@talashim.local', password: 'Admin12345!' },
  { role: 'WAREHOUSE', email: 'warehouse@talashim.local', password: 'Admin12345!' },
  { role: 'CUSTOMER', email: 'customer@talashim.local', password: 'Customer12345!' },
];

/** Probes that should succeed (200/201) for each role. */
const ROLE_PROBES = {
  SUPER_ADMIN: [
    { name: 'permissions/me', method: 'GET', path: '/admin/security/permissions/me' },
    { name: 'settings', method: 'GET', path: '/admin/settings' },
    { name: 'users', method: 'GET', path: '/admin/users?page=1' },
  ],
  SUPPORT: [
    { name: 'permissions/me', method: 'GET', path: '/admin/security/permissions/me' },
    { name: 'users', method: 'GET', path: '/admin/users?page=1' },
    { name: 'kyc', method: 'GET', path: '/admin/kyc?page=1' },
  ],
  ACCOUNTANT: [
    { name: 'permissions/me', method: 'GET', path: '/admin/security/permissions/me' },
    { name: 'orders', method: 'GET', path: '/admin/orders?page=1' },
    { name: 'products', method: 'GET', path: '/admin/products?page=1' },
  ],
  EDITOR: [
    { name: 'permissions/me', method: 'GET', path: '/admin/security/permissions/me' },
    { name: 'cms/blog', method: 'GET', path: '/admin/cms/blog?page=1' },
    { name: 'products', method: 'GET', path: '/admin/products?page=1' },
  ],
  WAREHOUSE: [
    { name: 'permissions/me', method: 'GET', path: '/admin/security/permissions/me' },
    { name: 'orders', method: 'GET', path: '/admin/orders?page=1' },
    { name: 'inventory', method: 'GET', path: '/admin/inventory?page=1' },
  ],
  CUSTOMER: [
    { name: 'profile', method: 'GET', path: '/users/me' },
    { name: 'cart', method: 'GET', path: '/cart/me' },
    { name: 'orders', method: 'GET', path: '/orders/me?page=1' },
  ],
};

async function request(method, path, token) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return response.status;
}

async function login(email, password) {
  let response;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (response.status !== 429) {
      break;
    }
    await sleep(1000 * (attempt + 1));
  }
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`login failed (${response.status}): ${body}`);
  }
  const data = await response.json();
  const token = data.tokens?.accessToken ?? data.accessToken;
  if (!token) {
    throw new Error('login response missing accessToken');
  }
  return { token, role: data.user?.role ?? 'unknown' };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log(`API base: ${API_BASE}\n`);

  const healthStatus = await request('GET', '/health');
  if (healthStatus !== 200) {
    console.error(`✗ /health → ${healthStatus} (start API first: pnpm dev:api)`);
    process.exitCode = 1;
    return;
  }
  console.log('✓ /health → 200\n');

  let failures = 0;

  for (const account of ACCOUNTS) {
    console.log(`── ${account.role} (${account.email}) ──`);
    try {
      const session = await login(account.email, account.password);
      console.log(`  ✓ login (jwt role: ${session.role})`);

      const probes = ROLE_PROBES[account.role] ?? [];
      for (const probe of probes) {
        const status = await request(probe.method, probe.path, session.token);
        const ok = status >= 200 && status < 300;
        console.log(`  ${ok ? '✓' : '✗'} ${probe.name} → ${status}`);
        if (!ok) failures += 1;
      }

      if (account.role === 'CUSTOMER') {
        const blocked = await request('GET', '/admin/users?page=1', session.token);
        const denied = blocked === 401 || blocked === 403;
        console.log(`  ${denied ? '✓' : '✗'} admin blocked → ${blocked} (expect 401/403)`);
        if (!denied) failures += 1;
      }
    } catch (error) {
      console.log(`  ✗ ${error instanceof Error ? error.message : String(error)}`);
      failures += 1;
    }
    console.log('');
    await sleep(300);
  }

  if (failures > 0) {
    console.log(`Done with ${failures} failure(s). Run: pnpm --filter @sadafgold/api prisma:seed`);
    process.exitCode = 1;
  } else {
    console.log('All role smoke tests passed.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
