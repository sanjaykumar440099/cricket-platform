import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly repo: Repository<Team>,
  ) {}

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
}
