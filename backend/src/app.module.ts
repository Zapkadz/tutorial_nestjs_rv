import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get<number>('DB_PORT', 5432)),
        username: config.get<string>('DB_USERNAME', 'bnvg'),
        password: config.get<string>('DB_PASSWORD', 'secret'),
        database: config.get<string>('DB_DATABASE', 'medium'),
        
        synchronize: true, 
        autoLoadEntities: true,
        logging: true,
      }),
    }),
    UsersModule,
  ],
})
export class AppModule {}
