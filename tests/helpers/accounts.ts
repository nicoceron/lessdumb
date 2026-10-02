import {
  test,
  type APIRequestContext,
  type APIResponse,
} from '@playwright/test';

// The full suite creates more accounts than the production signup quota allows
// in one minute. Respect Better Auth's retry header instead of disabling it.
export async function signUp(
  request: APIRequestContext,
  origin: string,
  data: { name: string; email: string; password: string },
): Promise<APIResponse> {
  test.setTimeout(Math.max(test.info().timeout, 180_000));
  for (let attempt = 0; ; attempt += 1) {
    const response = await request.post(`${origin}/api/auth/sign-up/email`, {
      headers: { origin },
      data,
    });
    if (response.status() !== 429 || attempt === 2) return response;

    const headers = response.headers();
    const value = headers['retry-after'] ?? headers['x-retry-after'];
    const seconds = value ? Number(value) : 60;
    const delay = Number.isFinite(seconds)
      ? Math.max(1, seconds) * 1000
      : Math.max(1000, Date.parse(value) - Date.now());
    if (!Number.isFinite(delay) || delay > 60_000)
      throw new Error(`Unexpected signup retry delay: ${value}`);
    await response.dispose();
    await new Promise((resolve) => setTimeout(resolve, delay + 250));
  }
}
