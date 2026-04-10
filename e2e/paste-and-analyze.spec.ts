import { test, expect } from '@playwright/test';

/**
 * Minimal E2E: load the app, upload a small PNG via the file picker, stub
 * /api/analyze with a fixed response, submit a message, and assert that
 * the annotated legend item is rendered.
 *
 * GPT-4o is never called — the route is intercepted at the browser level.
 */

// 1x1 transparent PNG, base64
const TINY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=';

test('upload image and analyze with stubbed API', async ({ page }) => {
  await page.route('**/api/analyze', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        annotations: [
          {
            id: 1,
            label: 'Name',
            value: '山田太郎',
            note: '姓名まとめて',
            bbox: { x: 0.1, y: 0.1, w: 0.3, h: 0.1 },
          },
        ],
        explanation: 'Name 欄に山田太郎を入力してください。',
      }),
    });
  });

  await page.goto('/');

  const fileInput = page.locator('input[type=file]');
  await fileInput.setInputFiles({
    name: 'test.png',
    mimeType: 'image/png',
    buffer: Buffer.from(TINY_PNG_BASE64, 'base64'),
  });

  await expect(page.getByLabel('入力したい内容')).toBeVisible();

  await page.getByLabel('入力したい内容').fill('名前は山田太郎');
  await page.getByRole('button', { name: '送信' }).click();

  await expect(page.getByText('山田太郎')).toBeVisible({ timeout: 10_000 });
  await expect(
    page.getByText('Name 欄に山田太郎を入力してください。'),
  ).toBeVisible();
});
