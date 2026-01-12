import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InningsEntity } from './entities/innings.entity';
import { InningsService } from './innings.service';
import { InningsController } from './innings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InningsEntity])],
  providers: [InningsService],
  controllers: [InningsController],
})
export class InningsModule {}
