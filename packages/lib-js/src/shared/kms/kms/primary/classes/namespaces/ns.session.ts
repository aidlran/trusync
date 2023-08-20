import type {
  ExportSessionResult,
  ImportSessionRequest,
  ImportSessionResult,
} from '../../../shared/interfaces/payloads/index.js';
import { KeysNS } from './ns.keys.js';

export class SessionNS extends KeysNS {
  destroySession() {
    this.keyIDs = [];
    // TODO: job that only forgets keys, doesn't wipe session key
    // or move the database stuff here to main thread
    return this.postJobAll({ action: 'destroySession' });
  }

  async exportSession(): Promise<ExportSessionResult> {
    const { payload } = await this.postJobSingle({ action: 'exportSession' });
    return payload;
  }

  async importSession<T extends boolean>(
    request: ImportSessionRequest<T>,
  ): Promise<ImportSessionResult<T>> {
    const [{ payload }] = await this.postJobAll({
      action: 'importSession',
      payload: { ...request, reexport: false },
    });

    this.keyIDs = this.keyIDs.concat(payload.importedKeyIDs);

    if (request.reexport) {
      return {
        ...payload,
        ...(await this.exportSession()),
        reexported: true,
      } as ImportSessionResult<T>;
    } else {
      return payload as ImportSessionResult<T>;
    }
  }
}
