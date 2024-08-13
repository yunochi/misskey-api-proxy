import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class ApiProxyService {
  private logger = new Logger('ApiProxyService');
  private misskey_url: string | undefined;
  private autoRevokeToken: string | undefined;
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.misskey_url = this.configService.get('MISSKEY_URL');
    this.autoRevokeToken = this.configService.get('TRY_AUTOREVOKE_TOKEN');
    this.logger.log(`Misskey URL: ${this.misskey_url}`);
  }
  public async getMyUserInfo(remote_ip?: string, auth?: string) {
    const { data } = await firstValueFrom(
      this.httpService
        .post(
          `${this.misskey_url}/api/i`,
          {},
          { headers: { Authorization: auth, 'x-forwarded-for': remote_ip } },
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw new HttpException(
              error.response?.data ?? 'Error',
              error.response?.status ?? 500,
            );
          }),
        ),
    );
    this.logger.log(`user ${data?.username} login`);
    if (this.autoRevokeToken === 'yes') {
      await firstValueFrom(
        this.httpService.post(`${this.misskey_url}/api/i/revoke-token`).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw new HttpException(
              error.response?.data ?? 'Error',
              error.status ?? 500,
            );
          }),
        ),
      );
    }
    return data;
  }
}
