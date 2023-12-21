export interface CreateSessionRequest<T = unknown> {
  metadata?: T;
  passphrase?: string;
}
