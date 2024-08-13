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
    this.logger.log(`user ${data?.username} login OK`);

    if (this.autoRevokeToken === '1') {
      const token = auth?.split(' ')[1];
      this.logger.log(`delete access token: ${token}...`);
      try {
        await firstValueFrom(
          this.httpService
            .post(
              `${this.misskey_url}/api/i/revoke-token`,
              { token: token },
              {
                headers: { Authorization: auth, 'x-forwarded-for': remote_ip },
              },
            )
            .pipe(
              catchError((error: AxiosError) => {
                this.logger.warn(error.response?.data);
                throw new Error(`Error!`);
              }),
            ),
        );
        this.logger.log(`Access token ${token} deleted`);
      } catch (err) {
        this.logger.warn(`Access token ${token} delete error`);
      }
    }
    return data;
  }
}
