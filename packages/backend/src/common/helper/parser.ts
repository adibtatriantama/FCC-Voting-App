import { TextDecoder } from 'util';

export const toUint8Array = (input: string): Uint8Array => {
  return Buffer.from(input);
};

export const fromUint8Array = (input: Uint8Array): string => {
  const decoder = new TextDecoder('utf-8');

  return decoder.decode(input);
};
