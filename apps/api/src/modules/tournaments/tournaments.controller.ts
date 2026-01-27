import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { TournamentsService } from './tournaments.service';

@Roles(UserRole.ADMIN)
@Controller('admin/tournaments')
export class TournamentsController {
  constructor(private readonly service: TournamentsService) {}

  @Post()
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post(':id/teams/:teamId')
  addTeam(
    @Param('id') id: string,
    @Param('teamId') teamId: string,
  ) {
    return this.service.addTeam(id, teamId);
  }
}
