import { Module } from '@nestjs/common';
import { ApiProxyService } from './api-proxy.service';
import { ApiProxyController } from './api-proxy.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [ApiProxyController],
  providers: [ApiProxyService],
})
export class ApiProxyModule {}
