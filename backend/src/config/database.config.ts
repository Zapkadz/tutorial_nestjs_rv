import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'bnvg',
  password: process.env.DB_PASSWORD || 'secret',
  database: process.env.DATABASE_NAME || 'medium',
  synchronize: true,
  autoLoadEntities: true,
  logging: true,
}));
