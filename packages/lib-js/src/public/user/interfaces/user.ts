import type { KeyPair } from '../../key-pair/interfaces/key-pair.js';

export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  keyPairs: KeyPair[];
}
