import { env } from 'cloudflare:workers';
import type { D1Database } from '@cloudflare/workers-types';
import { betterAuth } from 'better-auth';
import { authOptions } from './auth-options';
import type { Backend } from './backend-contract';
import { d1StateStore } from './d1-state-store';
import { nativePassword } from './native-password';

interface Bindings {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
}

// Bindings and the auth instance belong to this Worker, never to a learner.
// The authenticated session supplies the owner of every state operation.
let backend: Backend | undefined;
export async function getBackend(): Promise<Backend> {
  if (!backend) {
    const bindings = env as unknown as Bindings;
    if (
      !bindings.DB ||
      !bindings.BETTER_AUTH_URL ||
      !bindings.BETTER_AUTH_SECRET ||
      bindings.BETTER_AUTH_SECRET.length < 32
    )
      throw new Error(
        'Configure the D1 database, auth origin, and signing secret before serving accounts.',
      );
    const options = authOptions(
      {
        secret: bindings.BETTER_AUTH_SECRET,
        baseURL: bindings.BETTER_AUTH_URL,
      },
      bindings.DB,
    );
    const initialized = betterAuth({
      ...options,
      emailAndPassword: {
        ...options.emailAndPassword,
        password: nativePassword,
      },
    });
    const ready = initialized.$context.then(() => undefined);
    backend = {
      auth: {
        handler: (request) => initialized.handler(request),
        api: { getSession: (input) => initialized.api.getSession(input) },
        options: {
          baseURL: options.baseURL,
          trustedOrigins: options.trustedOrigins,
        },
      },
      states: d1StateStore(bindings.DB),
      ready: () => ready,
      close: () => {},
    };
  }
  await backend.ready();
  return backend;
}
