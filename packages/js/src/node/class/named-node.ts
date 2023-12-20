import type { Channel } from '../../channel/channel.js';
import { sha256 } from '../../crypto/hash/sha256.js';
import { Node } from './node.js';

export class NamedNode<T> extends Node<T> {
  constructor(
    channelModule: Channel[],
    readonly name: string,
  ) {
    super(channelModule);
  }

  async push(): Promise<void> {
    // TODO: put will do the hash and return it
    this._hash = await sha256(JSON.stringify(this._value));

    // this.channelModule.setNamed(name)

    this.emitChange();
  }
}
