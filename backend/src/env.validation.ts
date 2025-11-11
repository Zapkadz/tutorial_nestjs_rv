// src/env.validation.ts
import { z } from 'zod';

const INVALID_ENV_VARS_MESSAGE = '❌ Invalid environment variables:';

export const envSchema = z.object({
  PORT: z
    .string()
    .default('3000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val < 65536, {
      message: 'PORT must be a valid number between 1 and 65535',
    }),
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: z
    .string()
    .default('5432')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val < 65536, {
      message: 'DB_PORT must be a valid number between 1 and 65535',
    }),
  DB_USERNAME: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DATABASE_NAME: z.string().min(1),
  BCRYPT_SALT: z
    .string()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 20, {
      message: 'BCRYPT_SALT must be a valid number between 1 and 20',
    }),
  JWT_SECRET: z.string().min(1).default('devSecret'),
  JWT_EXPIRES_IN: z.string().min(1).default('1d'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(env: NodeJS.ProcessEnv): Env {
  const envWithDefaults = {
    ...env,
    DB_USERNAME: env.DB_USERNAME ?? 'dev_pg_user',
    DB_PASSWORD: env.DB_PASSWORD ?? 'dev_pg_password',
    DATABASE_NAME: env.DATABASE_NAME ?? 'nestjs_realworld',
  };

  const parsed = envSchema.safeParse(envWithDefaults);
  if (!parsed.success) {
    console.warn(INVALID_ENV_VARS_MESSAGE, parsed.error.format());
    process.exit(1);
  }
  return parsed.data;
}
