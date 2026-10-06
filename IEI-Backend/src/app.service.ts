import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'IEI Kuwait Backend API v1.0';
  }
}
