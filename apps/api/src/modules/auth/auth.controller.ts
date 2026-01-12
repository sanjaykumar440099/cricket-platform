import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * TEMP login endpoint
   * (Replace with real user validation later)
   */
  @Post('login')
  login(@Body() body: { userId: string; role: 'admin' | 'scorer' | 'viewer' }) {
    return this.authService.generateToken(body.userId, body.role);
  }
}
