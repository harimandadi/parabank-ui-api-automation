/**
 * Retry for things OUTSIDE the browser that can fail for a moment: an API call hitting a rate
 * limit, test data that is created asynchronously, a file that isn't written yet.
 *
 * In UI tests don't use this (or sleep) to wait for the page: use web-first assertions like
 * `await expect(locator).toBeVisible()`, which already retry. For "keep checking until true"
 * on a value, Playwright's `expect.poll()` / `expect().toPass()` are usually the better fit.
 */

export interface RetryOptions {
  /** Total tries, including the first one. Default 3. */
  attempts?: number;
  /** Wait before the 2nd try, in ms. Default 500. */
  delayMs?: number;
  /** Multiply the wait after each failure (2 → 500, 1000, 2000 ms). Default 2. */
  backoff?: number;
  /** Return false to stop retrying for this error (e.g. a 400 that will never succeed). */
  retryIf?: (error: unknown) => boolean;
}

/** Wait for ms milliseconds. Only for retry/backoff logic, never as a "wait for the page" in tests. */
export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Run fn until it succeeds or the attempts are used up; returns fn's result (generic T).
 *
 *   const user = await retry(() => accountApi.getByEmail(email), { attempts: 5, delayMs: 1000 });
 *
 * The final error says how many attempts were made and keeps the last error as `cause`.
 */
export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { attempts = 3, delayMs = 500, backoff = 2, retryIf = () => true } = options;
  if (attempts < 1) throw new Error(`retry needs at least 1 attempt, got ${attempts}`);

  let wait = delayMs;
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === attempts || !retryIf(error)) break;
      await sleep(wait);
      wait *= backoff;
    }
  }
  const reason = lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`Failed after ${attempts} attempt(s): ${reason}`, { cause: lastError });
}
