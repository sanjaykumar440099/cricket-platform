import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { PlayersService } from './players.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CreatePlayerDto } from './dto/create-player.dto';

@Roles(UserRole.ADMIN)
@Controller('admin/players')
export class PlayersController {
    constructor(private readonly players: PlayersService) { }

    @Post()
    create(@Body() dto: CreatePlayerDto) {
        return this.players.create(dto);
    }

    @Get()
    findAll() {
        return this.players.findAll();
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.players.remove(id);
    }
}
