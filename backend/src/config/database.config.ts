import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { validateEnv } from '../env.validation';

const validatedEnv = validateEnv(process.env);

export default registerAs('database', (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: validatedEnv.DB_HOST,
  port: validatedEnv.DB_PORT,
  username: validatedEnv.DB_USERNAME,
  password: validatedEnv.DB_PASSWORD,
  database: validatedEnv.DATABASE_NAME,
  synchronize: true,
  autoLoadEntities: true,
  logging: true,
}));
