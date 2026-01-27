import { Module } from '@nestjs/common';
import { Player } from "./entities/player.entity";
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { Team } from '../teams/entities/team.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Player, Team])],
    providers: [PlayersService],
    controllers: [PlayersController],
})
export class PlayersModule {}
