import type { HttpMethod } from '../types/http-method.js';
import { HttpError } from './http-error.js';

export class HttpResponseError extends HttpError {
  constructor(
    readonly method: HttpMethod,
    readonly url: string | URL,
    readonly status: number,
    readonly body: unknown,
  ) {
    const message = (function () {
      if (body) {
        switch (typeof body) {
          case 'string':
            return body;

          case 'object':
            if ((body as { message?: string }).message) {
              return (body as { message: string }).message;
            }
        }
      }
      return 'unknown error';
    })();

    super(method, url, message);
  }
}
