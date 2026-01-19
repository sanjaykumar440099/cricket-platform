import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.userRepo.findOne({ where: { id } });
  }

  async createUser(
    email: string,
    passwordHash: string,
    role: UserRole,
  ) {
    const user = this.userRepo.create({
      email,
      passwordHash,
      role,
    });
    return this.userRepo.save(user);
  }

  async updateRefreshToken(userId: string, hash: string | null) {
    await this.userRepo.update(userId, {
      refreshTokenHash: hash,
    });
  }
}
