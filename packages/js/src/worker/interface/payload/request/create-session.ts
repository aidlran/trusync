export interface CreateSessionRequest<T = unknown> {
  passphrase: string;
  metadata?: T;
}
