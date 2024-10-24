/* eslint-disable prettier/prettier */
import { Controller, Post, Body } from '@nestjs/common';
import { AlertsService } from './alert.service';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post('/set-alert')
  async setAlert(
    @Body('chain') chain: string,
    @Body('price') price: number,
    @Body('email') email: string,
  ) {
    await this.alertsService.createAlert(chain, price, email);
    return { message: 'Alert set successfully' };
  }
}
