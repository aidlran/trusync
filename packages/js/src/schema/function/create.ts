import type { Channel } from '../../channel/channel.js';
import { Node } from '../../node/node.js';
import type { SchemaConfig } from '../interface/schema-config.js';

// TODO: unused config is a placeholder
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function create<T>(channels: Channel[], config?: SchemaConfig) {
  return () => new Node<T>(channels);
}
