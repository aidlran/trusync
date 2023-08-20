import type { HttpMethod } from '../types/http-method.js';

export class HttpError extends Error {
  readonly friendlyMessage: string;
  constructor(
    readonly method: HttpMethod,
    readonly url: string | URL,
    message: string,
  ) {
    super(message);
    this.friendlyMessage = `Request failed: ${message}.`;
    this.message = `${method} ${url.toString()} ${this.friendlyMessage}`;
  }
}
