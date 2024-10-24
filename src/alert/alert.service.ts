/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './alert.entity';
import { PricesService } from '../price/price.servics';
import * as nodemailer from 'nodemailer';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    private readonly pricesService: PricesService,
  ) {}

  @Cron('0 * * * *') // Run every hour
  async checkPriceIncrease() {
    const prices = await this.pricesService.getPricesWithin24Hours();

    const oneHourAgoPrice = prices[prices.length - 2]; // 1 hour ago
    const currentPrice = prices[prices.length - 1]; // Latest price

    if (currentPrice.price > oneHourAgoPrice.price * 1.03) {
      await this.sendEmailAlert(currentPrice.chain, currentPrice.price);
    }
  }

  private async sendEmailAlert(chain: string, currentPrice: number) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your_email@gmail.com',
        pass: 'your_password',
      },
    });

    const mailOptions = {
      from: 'your_email@gmail.com',
      to: 'hyperhire_assignment@hyperhire.in',
      subject: `Price Alert: ${chain} increased more than 3%`,
      text: `${chain} price increased by more than 3%. Current price: ${currentPrice}`,
    };

    await transporter.sendMail(mailOptions);
  }

  // Create a new price alert
  async createAlert(chain: string, price: number, email: string) {
    const newAlert = this.alertRepository.create({ chain, price, email });
    await this.alertRepository.save(newAlert);
  }
}
