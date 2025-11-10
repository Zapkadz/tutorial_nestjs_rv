import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ArticlesModule } from './articles/articles.module';
import databaseConfig from './config/database.config';

const DATABASE_CONFIG_KEY = 'database';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const dbConfig = config.get<TypeOrmModuleOptions>(DATABASE_CONFIG_KEY);
        if (!dbConfig) {
          throw new Error('Database configuration is required');
        }
        return dbConfig;
      },
    }),
    UsersModule,
    AuthModule,
    ProfilesModule,
    ArticlesModule,
  ],
})
export class AppModule {}
