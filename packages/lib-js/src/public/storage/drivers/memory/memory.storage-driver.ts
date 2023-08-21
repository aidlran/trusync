import type { StorageDriver } from '../../interfaces/storage-driver.js';

export class MemoryDriver implements StorageDriver {
  private readonly data = new Map<string, string>();
  private readonly namedData = new Map<string, string>();

  deleteData(id: string): void {
    this.data.delete(id);
  }

  getData(id: string): string | undefined {
    return this.data.get(id);
  }

  putData(id: string, data: string): void {
    this.data.set(id, data);
  }

  deleteNamedData(name: string): void {
    this.namedData.delete(name);
  }

  getNamedDataID(name: string): string | undefined {
    return this.namedData.get(name);
  }

  setNamedData(name: string, id: string): void {
    this.namedData.set(name, id);
  }
}
