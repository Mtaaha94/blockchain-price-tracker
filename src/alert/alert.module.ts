/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertsService } from './alert.service';
import { AlertsController } from './alert.controller';
import { Alert } from './alert.entity';
import { PricesModule } from '../price/price.module'; // Import PricesModule to use PricesService

@Module({
  imports: [TypeOrmModule.forFeature([Alert]), PricesModule],
  providers: [AlertsService],
  controllers: [AlertsController],
})
export class AlertsModule {}
