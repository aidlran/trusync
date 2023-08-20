export interface IApiErrorResponse {
  // TODO: improve/standardise
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
}
