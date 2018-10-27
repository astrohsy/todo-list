import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  root(): string {
    return '/todos 로 요청을 보내주세요.';
  }
}
