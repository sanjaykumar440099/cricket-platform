import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/jwt-payload.interface';
@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(userId: string, role: JwtPayload['role']) {
    const payload: JwtPayload = {
      sub: userId,
      role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
