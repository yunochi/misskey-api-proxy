import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiProxyModule } from './api-proxy/api-proxy.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ApiProxyModule,
    ConfigModule.forRoot({ envFilePath: 'config.env', isGlobal: true }),
  ],
})
export class AppModule {}
