import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TournamentEntity } from '../tournaments/entities/tournament.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly repo: Repository<Team>,
    @InjectRepository(TournamentEntity)
    private readonly tournamentRepo: Repository<TournamentEntity>,
  ) { }

  create(dto: CreateTeamDto) {
    const team = this.repo.create(dto);
    return this.repo.save(team);
  }

  findAll() {
    return this.repo.find({ relations: ['players'] });
  }

  async findOne(id: string) {
    const team = await this.repo.findOne({
      where: { id },
      relations: ['players'],
    });
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  async update(id: string, dto: UpdateTeamDto) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const team = await this.findOne(id);
    await this.repo.remove(team);
    return { deleted: true };
  }

  async createForTournament(
    tournamentId: string,
    dto: CreateTeamDto,
  ) {
    const tournament = await this.tournamentRepo.findOne({
      where: { id: tournamentId },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    const team = this.repo.create({
      name: dto.name,
      shortName: dto.shortName,
      tournament,
    });

    return this.repo.save(team);
  }

  findByTournament(tournamentId: string) {
    return this.repo.find({
      where: { tournament: { id: tournamentId } },
      relations: ['players'],
    });
  }
}
