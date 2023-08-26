import { Data } from 'trusync';
import { writable } from 'svelte/store';
import type { DataStore } from '../interfaces/data-store.js';

export class DataStores {
  private readonly STORES_MAP = new Map<string, DataStore<any>>();
  private root: DataStore<any> | undefined;

  private createStore<T extends object>(
    data?: T & { id?: string },
    init?: Promise<T & { id: string }>,
  ): DataStore<T> {
    const STORES_MAP = this.STORES_MAP;
    const { set, subscribe } = writable<T>(data);
    const store: DataStore<T> = {
      subscribe,
      put,
    };

    let id = data?.id;

    if (id) {
      STORES_MAP.set(id, store);
    }

    void init?.then((data) => wrappedSet(data));

    return store;

    function wrappedSet(update: T & { id: string }) {
      set(update);
      if (store) {
        STORES_MAP.set(update.id, store);
      }
      if (id) {
        STORES_MAP.delete(id);
      }
      id = update.id;
    }

    function put(update: T): void {
      if (!id) {
        throw new Error('Data is not initialised');
      }
      void Data.replaceByID(id, update).then((result) =>
        wrappedSet({
          ...update,
          id: result.id,
        }),
      );
    }
  }

  create<T extends object>(data: T): DataStore<T> {
    return this.createStore<T>(
      data,
      Data.create(data).then(({ id }) => ({
        ...data,
        id,
      })),
    );
  }

  getByID<T extends { id: string }>(id: string): DataStore<T> {
    const store = this.STORES_MAP.get(id);

    if (store) {
      return store as DataStore<T>;
    }

    return this.createStore<T>(
      undefined,
      Data.getByID(id).then((data) => ({
        ...data,
        id,
      })) as Promise<T>,
    );
  }

  getRoot<T extends { id: string }>(appID: number): DataStore<T> {
    if (this.root) {
      return this.root as DataStore<T>;
    }

    return (this.root = this.createStore<T>(undefined, Data.pullRootData(appID) as Promise<T>));
  }
}
