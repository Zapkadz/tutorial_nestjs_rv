// src/env.validation.ts
import { z } from 'zod';

export const envSchema = z.object({
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val < 65536, {
      message: 'PORT must be a valid number between 1 and 65535',
    }),
  // Nếu có thêm biến môi trường khác thì thêm vào đây, ví dụ:
  // DATABASE_URL: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(env: NodeJS.ProcessEnv): Env {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.format());
    process.exit(1);
  }
  return parsed.data;
}
