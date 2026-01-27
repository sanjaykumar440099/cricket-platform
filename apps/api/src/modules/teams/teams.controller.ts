import { Controller, Post, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@Roles(UserRole.ADMIN)
@Controller('admin/teams')
export class TeamsController {
    constructor(private readonly teams: TeamsService) { }

    @Post()
    create(@Body() dto: CreateTeamDto) {
        return this.teams.create(dto);
    }

    @Get()
    findAll() {
        return this.teams.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.teams.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateTeamDto,
    ) {
        return this.teams.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.teams.remove(id);
    }
}
