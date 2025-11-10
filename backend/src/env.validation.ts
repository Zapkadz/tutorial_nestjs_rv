// src/env.validation.ts
import { z } from 'zod';

const INVALID_ENV_VARS_MESSAGE = '❌ Invalid environment variables:';

export const envSchema = z.object({
  PORT: z
    .string()
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
  DATABASE_NAME: z.string().min(1).default('medium'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(env: NodeJS.ProcessEnv): Env {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    console.warn(INVALID_ENV_VARS_MESSAGE, parsed.error.format());
    process.exit(1);
  }
  return parsed.data;
}
