export class TrusyncError extends Error {
  constructor(errorMessage: string) {
    super(`truSync: ${errorMessage}`);
  }
}
