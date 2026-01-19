import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/enums/user-role.enum';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  async register(email: string, password: string, role: UserRole) {
    const hash = await bcrypt.hash(password, 10);
    return this.usersService.createUser(email, hash, role);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException();

    const payload = { sub: user.id, role: user.role };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, refreshHash);

    return { accessToken, refreshToken };
  }

  private signAccessToken(userId: string, role: string) {
    return this.jwtService.sign(
      { sub: userId, role },
      { expiresIn: '15m' },
    );
  }

  private signRefreshToken(userId: string, role: string) {
    return this.jwtService.sign(
      { sub: userId, role },
      { expiresIn: '7d' },
    );
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshTokenHash) {
      throw new ForbiddenException('Access denied');
    }

    const valid = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!valid) {
      throw new ForbiddenException('Invalid refresh token');
    }

    const newAccessToken = this.signAccessToken(
      user.id,
      user.role,
    );

    const newRefreshToken = this.signRefreshToken(
      user.id,
      user.role,
    );

    const newHash = await bcrypt.hash(newRefreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, newHash);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }


  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
  }

}
