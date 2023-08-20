import type { HttpMethod } from './http-method.js';

export type HttpRequestInit = RequestInit & { method: HttpMethod };
