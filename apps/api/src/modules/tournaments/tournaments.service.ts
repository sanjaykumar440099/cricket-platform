import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TournamentEntity } from './entities/tournament.entity';
import { CreateTournamentDto } from './dto/create-tournament.dto';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectRepository(TournamentEntity)
    private readonly repo: Repository<TournamentEntity>,
  ) {}

  create(dto: CreateTournamentDto) {
    return this.repo.save(dto);
  }

  list() {
    return this.repo.find();
  }
}
