import type { Data } from '../data/data.js';
import type { Identity } from '../identity/identity.js';
import type { Channel } from '../data/channel/channel.js';

export class TrusyncApp {
  constructor(
    private readonly _channels: Channel[],
    readonly data: Data,
    readonly identity: Identity,
  ) {}

  get channels(): Channel[] {
    // Expose a shallow clone
    return [...this._channels];
  }

  pushChannel(channel: Channel): TrusyncApp {
    this._channels.push(channel);
    return this;
  }
}
