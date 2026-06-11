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
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';

@Roles(UserRole.ADMIN)
@Controller('admin/tournaments')
export class TournamentsController {
  constructor(private readonly service: TournamentsService) {}

  @Post()
  create(@Body() dto: CreateTournamentDto) {
    return this.service.create(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SCORER)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Roles(UserRole.ADMIN, UserRole.SCORER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTournamentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
