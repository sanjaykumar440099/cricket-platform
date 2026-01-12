import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InningsEntity } from './entities/innings.entity';
import { CreateInningsDto } from './dto/create-innings.dto';
import { JwtPayload } from '../auth/types/jwt-payload.interface';

@Injectable()
export class InningsService {
  constructor(
    @InjectRepository(InningsEntity)
    private readonly inningsRepo: Repository<InningsEntity>,
  ) {}

  async createInnings(dto: CreateInningsDto, user: JwtPayload) {
    if (!['admin', 'scorer'].includes(user.role)) {
      throw new ForbiddenException();
    }

    const innings = this.inningsRepo.create(dto);
    return this.inningsRepo.save(innings);
  }

  async endInnings(inningsId: string, user: JwtPayload) {
    if (!['admin', 'scorer'].includes(user.role)) {
      throw new ForbiddenException();
    }

    return this.inningsRepo.update(
      { id: inningsId },
      { isCompleted: true },
    );
  }
}
