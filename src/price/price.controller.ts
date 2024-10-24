/* eslint-disable prettier/prettier */
import { Controller, Get, Query } from '@nestjs/common';
import { PricesService } from './price.servics';
import Moralis from 'moralis';

@Controller('prices')
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  @Get('/swap-rate')
  async getSwapRate(@Query('ethAmount') ethAmount: number) {
    const ethToBtcRate = await Moralis.EvmApi.token.getTokenPrice({ address: 'BTC_CONTRACT_ADDRESS' });
    const usdPrice = (ethToBtcRate as any).price.usd;
    const fee = ethAmount * 0.03;
    const btcAmount = ethAmount * usdPrice;

    return {
      btcAmount: btcAmount - fee,
      totalFee: {
        eth: fee,
        usd: fee * usdPrice,
      },
    };
  }
}
