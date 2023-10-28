/**
 * @returns A function that returns a worker initialised at the entry point. We cannot return a new
 *   worker directly due to quirks with the URL path and bundlers.
 */
export function workerConstructor(): () => Worker {
  return () =>
    new Worker(new URL('./worker-entrypoint.js?worker', import.meta.url), { type: 'module' });
}
