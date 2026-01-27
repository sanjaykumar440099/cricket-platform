import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './entities/player.entity';
import { Team } from '../teams/entities/team.entity';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly repo: Repository<Player>,
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
  ) {}

  async create(dto: any) {
    const team = await this.teamRepo.findOne({
      where: { id: dto.teamId },
    });
    if (!team) throw new NotFoundException('Team not found');

    const player = this.repo.create({
      name: dto.name,
      role: dto.role,
      team,
    });

    return this.repo.save(player);
  }

  findAll() {
    return this.repo.find({ relations: ['team'] });
  }

  async remove(id: string) {
    const player = await this.repo.findOne({ where: { id } });
    if (!player) throw new NotFoundException('Player not found');
    await this.repo.remove(player);
    return { deleted: true };
  }
}
