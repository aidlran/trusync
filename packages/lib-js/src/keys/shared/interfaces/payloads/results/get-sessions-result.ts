export type GetSessionsResult<T = unknown> = Array<{
  id: number;
  metadata?: T;
}>;
