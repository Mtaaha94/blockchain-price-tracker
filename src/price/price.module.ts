/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricesService } from './price.servics';
import { PricesController } from './price.controller';
import { Price } from './price.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Price])],
  providers: [PricesService],
  controllers: [PricesController],
  exports: [PricesService], 
})
export class PricesModule {}
