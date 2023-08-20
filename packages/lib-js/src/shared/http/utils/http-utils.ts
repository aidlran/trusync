import { HttpError } from '../errors/http-error.js';
import { HttpResponseError } from '../errors/http-response-error.js';
import type { IApiErrorResponse } from '../interfaces/api-error-response.js';
import type { HttpRequestInit } from '../types/request-init.js';

// TODO: JSON body

async function fetchWithErrorHandling(url: string, init: HttpRequestInit) {
  const response = await fetch(`/api/${url}`, init).catch(() => {
    throw new HttpError(init.method, url, 'server could not be reached');
  });

  if (!response.ok) {
    throw new HttpResponseError(
      init.method,
      url,
      response.status,
      await response.json().catch(() => null),
    );
  }

  return response;
}

async function fetchJSON<T extends object>(
  url: string,
  init: HttpRequestInit,
): Promise<T & IApiErrorResponse> {
  const response = await fetchWithErrorHandling(url, init);

  try {
    // TODO: unsafe. check if fail response. assert.
    return response.json() as Promise<T & IApiErrorResponse>;
  } catch (e) {
    throw new HttpError(init.method, url, 'could not parse response as JSON');
  }
}

async function fetchJsonWithBody<T extends object>(
  url: string,
  init: HttpRequestInit,
  data: Record<string, string | Blob>,
) {
  const body = new FormData();

  for (const [name, value] of Object.entries(data)) {
    body.set(name, value);
  }

  return fetchJSON<T>(url, { ...init, body });
}

export function DELETE<T extends object>(url: string, init: RequestInit = {}) {
  return fetchJSON<T>(url, { ...init, method: 'DELETE' });
}

export function GET<T extends object>(url: string, init: RequestInit = {}) {
  return fetchJSON<T>(url, { ...init, method: 'GET' });
}

export function PATCH<T extends object>(
  url: string,
  data: Record<string, string | Blob>,
  init: RequestInit = {},
) {
  return fetchJsonWithBody<T>(url, { ...init, method: 'PATCH' }, data);
}

export function POST<T extends object>(
  url: string,
  data: Record<string, string | Blob>,
  init: RequestInit = {},
) {
  return fetchJsonWithBody<T>(url, { ...init, method: 'POST' }, data);
}

export function PUT<T extends object>(
  url: string,
  data: Record<string, string | Blob>,
  init: RequestInit = {},
) {
  return fetchJsonWithBody<T>(url, { ...init, method: 'PUT' }, data);
}
