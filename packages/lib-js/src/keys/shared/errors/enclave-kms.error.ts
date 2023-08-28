export class EnclaveKmsError extends Error {
  constructor(errorMessage: string) {
    super(`truSync KMS: ${errorMessage}`);
  }
}
