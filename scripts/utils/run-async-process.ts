/**
 * Safely executes the given `fn` as a promise with errors automatically caught.
 */
export function runAsyncProcess(fn: () => void | Promise<void>) {
  Promise.resolve(fn()).catch(() => {
    process.exit(1);
  });
}
