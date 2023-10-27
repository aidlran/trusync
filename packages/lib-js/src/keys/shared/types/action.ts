export type Action =
  | 'forgetIdentity'
  | 'generateIdentity'
  | 'importIdentity'
  | 'initSession'
  | 'reset'
  | 'saveSession'
  | 'useSession'
  | 'workerReady';
