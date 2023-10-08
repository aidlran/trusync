import { KeyManagerActionError, KeyManagerError } from '../../shared/index.js';
import type { Action, CompletedJob, FailedJob, Job } from '../../shared/types/index.js';
import type { IAdapter, KeyPair, Session, SessionKey } from '../interfaces/index.js';
import { kvStoreDelete, kvStoreGet, kvStoreSet } from '../utils/db.js';
import { KeyPairMap } from './key-pair-map.js';
import { WrappedAdapter } from './wrapped-adapter.js';

// TODO: group methods into namespaces

export class Worker<PrivateKeyType, PublicKeyType, SessionKeyType> {
  private readonly adapter: WrappedAdapter<PrivateKeyType, PublicKeyType, SessionKeyType>;
  private keyPairMap = new KeyPairMap<PrivateKeyType, PublicKeyType>();

  constructor(adapter: IAdapter<PrivateKeyType, PublicKeyType, SessionKeyType>) {
    this.adapter = new WrappedAdapter(adapter);

    self.onmessage = async (event: MessageEvent<Job<Action>>) => {
      const job: Job<Action> = event.data;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handler: (job?: any) => Promise<unknown> = this[job.action].bind(this);

      try {
        self.postMessage(await handler(job));
      } catch (e) {
        this.errorResponse('No such action', job);
      }
    };
  }

  /**
   * Ensures an error response message is sent on exception.
   * @param fn The function to wrap.
   * @param job The job being processed.
   * @returns The return from `fn`.
   */
  private async wrapJob<T, A extends Action>(
    fn: () => T | Promise<T>,
    job: Job<A>,
  ): Promise<Awaited<T>> {
    try {
      return await fn();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.errorResponse(errorMessage, job);
      throw error instanceof KeyManagerError
        ? error
        : new KeyManagerActionError(job.action, errorMessage);
    }
  }

  private errorResponse<A extends Action>(error: string, job: Job<A>): void {
    const { action, jobID } = job;

    const response: FailedJob<A> = {
      action,
      error,
      jobID,
      ok: false,
    };

    self.postMessage(response);
  }

  private asymmetricDecrypt = (
    job: Job<'asymmetricDecrypt'>,
  ): Promise<CompletedJob<'asymmetricDecrypt'>> =>
    this.wrapJob(async () => {
      const { action, jobID } = job;
      const { kmsKeyID, payload } = job.payload;

      const privateKey = this.keyPairMap.getPrivateKey(kmsKeyID, job);

      const decryptedMessage = await this.adapter.decryptWithPrivateKey(payload, privateKey);

      return {
        action,
        jobID,
        ok: true,
        payload: { payload: decryptedMessage },
      };
    }, job);

  private asymmetricEncrypt = (
    job: Job<'asymmetricEncrypt'>,
  ): Promise<CompletedJob<'asymmetricEncrypt'>> =>
    this.wrapJob(async () => {
      const { action, jobID } = job;
      const { kmsKeyID, payload } = job.payload;

      const publicKey = this.keyPairMap.getPublicKey(kmsKeyID, job);

      const encryptedMessage = await this.adapter.encryptWithPublicKey(payload, publicKey);

      return {
        action,
        jobID,
        ok: true,
        payload: {
          kmsKeyID,
          payload: encryptedMessage,
        },
      };
    }, job);

  private destroySession = (job: Job<'destroySession'>): Promise<CompletedJob<'destroySession'>> =>
    this.wrapJob(async () => {
      const { action, jobID } = job;
      this.keyPairMap.clear();
      await kvStoreDelete('session_key');
      return { action, jobID, ok: true };
    }, job);

  private encryptPrivateKey = (
    job: Job<'encryptPrivateKey'>,
  ): Promise<CompletedJob<'encryptPrivateKey'>> =>
    this.wrapJob(async () => {
      const { action, jobID } = job;
      const { privateKey, secret } = job.payload;

      return {
        action,
        jobID,
        ok: true,
        payload: {
          privateKey: await this.adapter.encryptPrivateKey(
            await this.adapter.parsePrivateKey(privateKey),
            secret,
          ),
        },
      };
    }, job);

  private exportSession = (job: Job<'exportSession'>): Promise<CompletedJob<'exportSession'>> =>
    this.wrapJob(async () => {
      const { action, jobID } = job;

      const session: Session = {
        keys: new Array<SessionKey>(),
      };

      for (const [id, keyPair] of this.keyPairMap) {
        const sessionKeyPair: SessionKey = {
          id,
          publicKey: await this.adapter.stringifyPublicKey(keyPair.publicKey),
        };
        if (keyPair.privateKey)
          sessionKeyPair.privateKey = await this.adapter.stringifyPrivateKey(keyPair.privateKey);
        session.keys.push(sessionKeyPair);
      }

      const payload = JSON.stringify(session);

      const key = new TextDecoder().decode(crypto.getRandomValues(Uint8Array.from({ length: 32 })));

      const [sessionPayload] = await Promise.all([
        this.adapter.symmetricEncrypt(payload, key),

        // Store the session key
        kvStoreSet('session_key', key),
      ]);

      return {
        action,
        jobID,
        ok: true,
        payload: { sessionPayload },
      };
    }, job);

  private generateKeyPair = (
    job: Job<'generateKeyPair'>,
  ): Promise<CompletedJob<'generateKeyPair'>> =>
    this.wrapJob(async () => {
      const { action, jobID } = job;

      const keyPair = await this.adapter.generateKeyPair();

      const privateKeyPromise = job.payload?.secret
        ? this.adapter.encryptPrivateKey(keyPair.privateKey, job.payload.secret)
        : this.adapter.stringifyPrivateKey(keyPair.privateKey);

      const publicKeyPromise = this.adapter.stringifyPublicKey(keyPair.publicKey);

      const [privateKey, publicKey] = await Promise.all([privateKeyPromise, publicKeyPromise]);

      return {
        action,
        jobID,
        ok: true,
        payload: {
          privateKey,
          publicKey,
        },
      };
    }, job);

  private hybridDecrypt = (job: Job<'hybridDecrypt'>): Promise<CompletedJob<'hybridDecrypt'>> =>
    this.wrapJob(async () => {
      const { action, jobID } = job;
      const { kmsKeyID, payloadKey, payload } = job.payload;

      const privateKey = this.keyPairMap.getPrivateKey(kmsKeyID, job);

      const sessionKey = await this.adapter.decryptSessionKey(payloadKey, privateKey);

      const decryptedMessage = await this.adapter.decryptWithSessionKey(payload, sessionKey);

      return {
        action,
        jobID,
        ok: true,
        payload: { payload: decryptedMessage },
      };
    }, job);

  private hybridEncrypt = (job: Job<'hybridEncrypt'>): Promise<CompletedJob<'hybridEncrypt'>> =>
    this.wrapJob(async () => {
      const { action, jobID } = job;
      const { kmsKeyID, payload } = job.payload;

      const publicKey = this.keyPairMap.getPublicKey(kmsKeyID, job);

      const sessionKey = await this.adapter.generateSessionKey(publicKey);

      const [encryptedMessage, encryptedSessionKey] = await Promise.all([
        this.adapter.encryptWithSessionKey(payload, sessionKey),
        this.adapter.encryptSessionKey(sessionKey, publicKey),
      ]);

      return {
        action,
        jobID,
        ok: true,
        payload: {
          payload: encryptedMessage,
          payloadKey: encryptedSessionKey,
        },
      };
    }, job);

  private importKeyPair = (job: Job<'importKeyPair'>): Promise<CompletedJob<'importKeyPair'>> =>
    this.wrapJob(async () => {
      const { action, jobID } = job;
      const { keyID, privateKey, publicKey, secret } = job.payload;

      // TODO: derive public key from private key if necessary

      const keyPair: KeyPair<PrivateKeyType, PublicKeyType> = {
        publicKey: await this.adapter.parsePublicKey(publicKey),
      };

      if (privateKey)
        keyPair.privateKey = await (secret
          ? this.adapter.decryptPrivateKey(privateKey, secret)
          : this.adapter.parsePrivateKey(privateKey));

      this.keyPairMap.set(keyID, keyPair);

      return {
        action,
        jobID,
        ok: true,
        payload: { keyIDs: [keyID] },
      };
    }, job);

  private importSession = (job: Job<'importSession'>): Promise<CompletedJob<'importSession'>> =>
    this.wrapJob(async () => {
      const { action, jobID } = job;
      const sessionEncrypted = job.payload.sessionPayload;

      const key = await kvStoreGet('session_key').catch(() => {
        throw new KeyManagerActionError(job.action, 'No session key found');
      });

      const sessionDecrypted = await this.adapter.symmetricDecrypt(sessionEncrypted, key);

      const session: Session = (() => {
        try {
          return JSON.parse(sessionDecrypted) as Session;
        } catch (e) {
          throw new KeyManagerActionError(job.action, 'Unable to parse session data');
        }
      })();

      const importedKeyIDs = new Array<string>();
      let ok = true;

      await Promise.allSettled(
        session.keys.map(async ({ id: keyID, privateKey, publicKey }) => {
          try {
            const keyImportResult = await this.importKeyPair({
              action: 'importKeyPair',
              jobID,
              payload: { keyID, privateKey, publicKey },
            });
            importedKeyIDs.push(keyID);
            return keyImportResult;
          } catch (e) {
            ok = false;
          }
        }),
      );

      return {
        action,
        jobID,
        ok,
        payload: {
          importedKeyIDs,
          reexported: false,
        },
      };
    }, job);

  private hybridShareKey = (job: Job<'hybridShareKey'>): Promise<CompletedJob<'hybridShareKey'>> =>
    this.wrapJob(async () => {
      const { action, jobID } = job;
      const { decryptKeyID, encryptKeyID, sessionKey } = job.payload;

      const decryptKey = this.keyPairMap.getPrivateKey(decryptKeyID, job);
      const encryptKey = this.keyPairMap.getPublicKey(encryptKeyID, job);

      const decryptedSessionKey = await this.adapter.decryptSessionKey(sessionKey, decryptKey);
      const encryptedSessionKey = await this.adapter.encryptSessionKey(
        decryptedSessionKey,
        encryptKey,
      );

      return {
        action,
        jobID,
        ok: true,
        payload: {
          kmsKeyID: encryptKeyID,
          payload: encryptedSessionKey,
        },
      };
    }, job);

  private symmetricDecrypt = (
    job: Job<'symmetricDecrypt'>,
  ): Promise<CompletedJob<'symmetricDecrypt'>> =>
    this.wrapJob(async () => {
      const { action, jobID } = job;
      const { payload, passphrase } = job.payload;

      return {
        action,
        jobID,
        ok: true,
        payload: {
          payload: await this.adapter.symmetricDecrypt(payload, passphrase),
        },
      };
    }, job);

  private symmetricEncrypt = (
    job: Job<'symmetricEncrypt'>,
  ): Promise<CompletedJob<'symmetricEncrypt'>> =>
    this.wrapJob(async () => {
      const { action, jobID } = job;
      const { payload, passphrase } = job.payload;

      return {
        action,
        jobID,
        ok: true,
        payload: {
          payload: await this.adapter.symmetricEncrypt(payload, passphrase),
        },
      };
    }, job);
}
