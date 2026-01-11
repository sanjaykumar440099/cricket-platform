import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { LiveModule } from './modules/live/live.module';
import { typeOrmConfig } from '../src/database/ormconfig';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: typeOrmConfig,
        }),
        HealthModule,
        LiveModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
