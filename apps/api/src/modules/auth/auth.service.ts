import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  login(payload: any) {
    return { token: 'stub-token', payload };
  }
}
