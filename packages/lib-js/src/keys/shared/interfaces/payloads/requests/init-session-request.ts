export interface InitSessionRequest<T = unknown> {
  metadata?: T;
  pin: string;
}
