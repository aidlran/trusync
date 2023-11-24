export class Identity {
  constructor(
    readonly addressValue: string,
    readonly addressType: number,
    readonly publicEncryptionKey: Uint8Array,
    readonly encryptionKeyAlgorithm: number,
    readonly publicSigningKey: Uint8Array,
    readonly signingKeyAlgorithm: number,
  ) {}
}
