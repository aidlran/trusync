import * as base from 'base-x';
import { encodeByteArrayString } from '../common/buffer-utils';

export const base58 = base('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz');

export const base64 = {
  decode: function (encoded: string): string {
    return atob(encoded);
  },
  encode: function (input: Uint8Array): string {
    return btoa(encodeByteArrayString(input));
  },
};

export const base64Url = {
  decode: function (encoded: string): string {
    return atob(encoded.replace(/-/g, '+').replace(/_/g, '/'));
  },
  encode: function (input: string): string {
    return btoa(input.replace(/-/g, '+').replace(/_/g, '/'));
  },
};
