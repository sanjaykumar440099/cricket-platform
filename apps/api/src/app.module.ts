import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { LiveModule } from './modules/live/live.module';
import { typeOrmConfig } from '../src/database/ormconfig';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchEntity } from './modules/matches/entities/match.entity';
import { InningsEntity } from './modules/matches/entities/innings.entity';
import { PlayerEntity } from './modules/matches/entities/player.entity';
import { ScoreSnapshotEntity } from './modules/matches/entities/score-snapshot.entity';
import { BallEntity } from './modules/matches/entities/ball.entity';
import { BallsModule } from './modules/balls/balls.module';
import { AuthModule } from './modules/auth/auth.module';
import { MatchesModule } from './modules/matches/matches.module';
import { InningsModule } from './modules/innings/innings.module';
import { ScoresModule } from './modules/scores/scores.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: typeOrmConfig,
        }),
        TypeOrmModule.forFeature([InningsEntity, PlayerEntity, MatchEntity, ScoreSnapshotEntity, BallEntity]),
        HealthModule,
        LiveModule,
        AuthModule,
        MatchesModule,
        InningsModule,
        BallsModule,
        LiveModule,
        ScoresModule
    ],
    controllers: [],
    providers: []
})
export class AppModule { }
