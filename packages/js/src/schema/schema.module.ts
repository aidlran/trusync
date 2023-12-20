import { getChannelModule } from '../channel/channel.module.js';
import { createModule } from '../module/create-module.js';
import { NamedNode } from '../node/class/named-node.js';
import { Node } from '../node/class/node.js';
import type { SchemaConfig } from './interface/schema-config.js';

export function createSchema<T = unknown>(
  appID?: string,
  config?: SchemaConfig & { named: string },
): () => NamedNode<T>;

export function createSchema<T = unknown>(appID?: string, config?: SchemaConfig): () => Node<T>;

export function createSchema<T = unknown>(
  config?: SchemaConfig & { named: string },
): () => NamedNode<T>;

export function createSchema<T = unknown>(config?: SchemaConfig): () => Node<T>;

export function createSchema<T = unknown>(param1?: string | SchemaConfig, param2?: SchemaConfig) {
  const resolvedAppID = typeof param1 === 'string' ? param1 : undefined;
  const resolvedConfig =
    param2 ?? (!resolvedAppID && typeof param1 === 'object' ? param1 : undefined);

  const channelModule = getChannelModule(resolvedAppID);

  return createModule(() => {
    if (resolvedConfig?.named) {
      const name = resolvedConfig.named;
      return () => new NamedNode<T>(channelModule, name);
    } else {
      return () => new Node<T>(channelModule);
    }
  })(resolvedAppID);
}
