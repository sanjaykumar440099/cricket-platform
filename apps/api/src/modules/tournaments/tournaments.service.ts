import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TournamentEntity } from './entities/tournament.entity';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { Team } from '../teams/entities/team.entity';
import { UpdateTournamentDto } from './dto/update-tournament.dto';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectRepository(TournamentEntity)
    private readonly repo: Repository<TournamentEntity>,
    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,
  ) {}

  create(dto: CreateTournamentDto) {
    const tournament = this.repo.create(dto);
    return this.repo.save(tournament);
  }

  findAll() {
    return this.repo.find({
      relations: ['teams', 'matches'],
    });
  }

  async findOne(id: string) {
    const t = await this.repo.findOne({
      where: { id },
      relations: ['teams', 'matches'],
    });
    if (!t) throw new NotFoundException('Tournament not found');
    return t;
  }

  async update(id: string, dto: UpdateTournamentDto) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const t = await this.findOne(id);
    await this.repo.remove(t);
    return { deleted: true };
  }

  async addTeam(tournamentId: string, teamId: string) {
    const tournament = await this.findOne(tournamentId);
    const team = await this.teamRepo.findOne({
      where: { id: teamId },
    });

    if (!team) throw new NotFoundException('Team not found');

    tournament.teams = tournament.teams || [];
    tournament.teams.push(team);

    return this.repo.save(tournament);
  }
}

