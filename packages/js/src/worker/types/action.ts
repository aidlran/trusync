export type Action = PostToAllAction | PostToOneAction | 'workerReady';

export type PostToAllAction = 'session.clear' | 'session.load';

export type PostToOneAction = 'session.create' | 'session.import';
