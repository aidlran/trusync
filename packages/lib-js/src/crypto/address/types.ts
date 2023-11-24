export enum AddressType {
  DERIVED_SHA_B58 = 0,
}

export interface Address {
  type: AddressType;
  value: string;
}
