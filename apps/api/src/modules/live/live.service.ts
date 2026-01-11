import { Injectable } from '@nestjs/common';

@Injectable()
export class LiveService {
  emit(event: string, payload: any) {
    // stub: emit via gateway
  }
}
