import { type Hash, sha256 } from '../../crypto/hash/index.js';
import type { Channel } from '../../channel/channel.js';

type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

type OnChangeCallback<T> = (value: DeepReadonly<T> | undefined) => unknown;

export class Node<T> {
  private readonly listeners = new Set<OnChangeCallback<T>>();

  protected _hash: Hash | undefined;
  protected _value: T | undefined;

  constructor(private readonly channelModule: Channel[]) {}

  get hash(): DeepReadonly<Hash> | undefined {
    return this._hash;
  }

  get value(): DeepReadonly<T> | undefined {
    return this._value;
  }

  set value(value: T) {
    this._value = value;
  }

  protected emitChange(): void {
    for (const callback of this.listeners) {
      // TODO: investigate eslint issue
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      callback(this._value);
    }
  }

  onChange(callback: OnChangeCallback<T>): void {
    this.listeners.add(callback);
  }

  async push(): Promise<void> {
    // TODO: put will do the hash and return it
    this._hash = await sha256(JSON.stringify(this._value));

    // this.channelModule.put();

    this.emitChange();
  }
}
