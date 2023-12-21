export type Action =
  | 'clearSession'
  | 'forgetIdentity'
  | 'generateIdentity'
  | 'importIdentity'
  | 'initSession' // TODO: may be deprecated by "session.create"
  | 'saveSession'
  | 'session.create'
  | 'useSession'
  | 'workerReady';
