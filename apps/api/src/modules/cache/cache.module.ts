import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';

@Global() // IMPORTANT
@Module({
  providers: [CacheService],
  exports: [CacheService], // REQUIRED
})
export class CacheModule {}
