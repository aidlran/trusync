export type ObservableCallback<T> = (value: T) => unknown;

export class Observable<T> {
  private readonly listeners = new Set<ObservableCallback<T>>();

  constructor(private value: T) {}

  get(): Readonly<T> {
    return this.value;
  }

  update(updater: (value: T) => T): void {
    this.value = updater(this.value);
    this.emit();
  }

  emit(): void {
    for (const callback of this.listeners) {
      // TODO: investigate eslint issue
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      callback(this.value);
    }
  }

  /** @returns An unsubscribe function. */
  subscribe(callback: ObservableCallback<T>): () => void {
    this.listeners.add(callback);
    callback(this.value);
    return () => this.listeners.delete(callback);
  }
}
