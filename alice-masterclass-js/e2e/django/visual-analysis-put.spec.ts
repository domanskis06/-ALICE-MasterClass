import { test, expect } from '@playwright/test';

const password = process.env.E2E_SESSION_PASSWORD ?? 'playwright-e2e';

/** Contract aligned with Django strangeness API tests (student 0, dataset 1). */
test.describe('Django visual analysis API', () => {
  test('PUT strangeness_visual_analysis succeeds with session password', { tag: ['@django'] }, async ({
    request,
  }) => {
    const res = await request.put('http://127.0.0.1:8000/api/v1/strangeness_visual_analysis/0/1/', {
      data: {
        password,
        results: {
          '0': { particle: 'k0', mass: 0.498 },
        },
      },
      headers: { 'Content-Type': 'application/json' },
    });
    const body = await res.text();
    expect(res.ok(), `HTTP ${res.status()}: ${body}`).toBeTruthy();
  });
});
