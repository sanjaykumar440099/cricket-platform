import { Controller, Post, Body, Param } from '@nestjs/common';
import { InningsService } from './innings.service';
import { CreateInningsDto } from './dto/create-innings.dto';
import { HttpUser } from '../auth/decorators/http-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';

@Controller('innings')
export class InningsController {
  constructor(private readonly inningsService: InningsService) {}

  @Post()
  create(@Body() dto: CreateInningsDto, @HttpUser() user: JwtPayload) {
    return this.inningsService.createInnings(dto, user);
  }

  @Post(':id/end')
  end(@Param('id') id: string, @HttpUser() user: JwtPayload) {
    return this.inningsService.endInnings(id, user);
  }
}
