import type { AccountState } from '../account';
import type { LearnerState } from '../state';

export interface BackendAuth {
  handler: (request: Request) => Promise<Response>;
  api: {
    getSession: (input: {
      headers: Headers;
    }) => Promise<{ user: { id: string } } | null>;
  };
  options: { baseURL: string; trustedOrigins: string[] };
}

export interface StateWriteResult {
  saved: boolean;
  value: AccountState;
}

export interface StateStore {
  read: (userId: string) => AccountState | Promise<AccountState>;
  write: (
    userId: string,
    state: LearnerState,
    revision: number,
  ) => StateWriteResult | Promise<StateWriteResult>;
  /** Deletes the learner's saved progress (account deletion). */
  remove: (userId: string) => void | Promise<void>;
}

export interface Backend {
  auth: BackendAuth;
  states: StateStore;
  ready: () => Promise<void>;
  close: () => void;
}
