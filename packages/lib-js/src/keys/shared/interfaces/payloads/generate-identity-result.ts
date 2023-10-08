export interface GenerateIdentityResult {
  address: {
    value: string;
    type: number;
  };
  encryption: {
    publicKey: Uint8Array;
    type: number;
  };
  secret: Uint8Array;
  signing: {
    publicKey: Uint8Array;
    type: number;
  };
}
