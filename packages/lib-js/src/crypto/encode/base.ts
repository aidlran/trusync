import base from 'base-x';
import { encodeByteArrayString } from '../common/buffer-utils.js';

export const base58 = base('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');

export const base64 = {
  decode(encoded: string): string {
    return atob(encoded);
  },
  encode(input: Uint8Array): string {
    return btoa(encodeByteArrayString(input));
  },
};

export const base64Url = {
  decode(encoded: string): string {
    return atob(encoded.replace(/-/g, '+').replace(/_/g, '/'));
  },
  encode(input: string): string {
    return btoa(input.replace(/-/g, '+').replace(/_/g, '/'));
  },
};
