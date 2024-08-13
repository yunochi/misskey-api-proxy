import { Controller, Get, Headers, Logger } from '@nestjs/common';
import { ApiProxyService } from './api-proxy.service';

@Controller('api-proxy')
export class ApiProxyController {
  private logger = new Logger('ApiProxyController');
  constructor(private readonly apiProxyService: ApiProxyService) {}
  @Get('i/get')
  public async getMyUserInfo(
    @Headers('x-forwarded-for') remote_ip: string,
    @Headers('authorization') auth: string,
    @Headers() headers: string,
  ) {
    this.logger.log(headers);
    return await this.apiProxyService.getMyUserInfo(remote_ip, auth);
  }
}
