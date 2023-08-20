export class EnclaveKmsError extends Error {
  constructor(errorMessage: string) {
    super(`Enclave KMS: ${errorMessage}`);
  }
}
