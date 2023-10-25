export type Action =
  | 'forgetIdentity'
  | 'generateIdentity'
  | 'getSessions'
  | 'importIdentity'
  | 'initSession'
  | 'reset'
  | 'saveSession'
  | 'useSession'
  | 'workerReady';
