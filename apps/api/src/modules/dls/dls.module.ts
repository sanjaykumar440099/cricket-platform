import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DlsService } from './dls.service';
import { DlsController } from './dls.controller';
import { DlsResultEntity } from './entities/dls-result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DlsResultEntity]),
  ],
  providers: [DlsService],
  controllers: [DlsController],
  exports: [DlsService],
})
export class DlsModule {}
