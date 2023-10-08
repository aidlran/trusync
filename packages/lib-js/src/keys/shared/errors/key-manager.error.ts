export class KeyManagerError extends Error {
  constructor(errorMessage: string) {
    super(`truSync key manager: ${errorMessage}`);
  }
}
