export function createWorker(): Worker {
  return new Worker(new URL('./keys/worker/worker.js?worker', import.meta.url), {
    type: 'module',
  });
}
