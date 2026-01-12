import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { JwtPayload } from '../../auth/types/jwt-payload.interface';

@Injectable()
export class WsAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    canActivate(context: ExecutionContext): boolean {
        const client: Socket = context.switchToWs().getClient();

        const token =
            client.handshake.auth?.token ||
            client.handshake.headers?.authorization?.replace('Bearer ', '');

        if (!token) {
            throw new UnauthorizedException('Missing token');
        }

        try {
            const payload = this.jwtService.verify<JwtPayload>(token);
            client.data.user = payload;
            return true;
        } catch {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
