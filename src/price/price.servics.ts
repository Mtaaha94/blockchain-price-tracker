/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Price } from './price.entity';
import { Cron } from '@nestjs/schedule';
import Moralis from 'moralis';

@Injectable()
export class PricesService {
  constructor(
    @InjectRepository(Price)
    private readonly priceRepository: Repository<Price>,
  ) {
    // Initialize Moralis with your API key from the environment variable
    const moralisApiKey = process.env.MORALIS_API_KEY;

    if (!moralisApiKey) {
      console.error('Moralis API Key is missing!');
    } else {
      Moralis.start({
        apiKey: moralisApiKey,
      });
      console.log('Moralis API initialized');
    }
  }

  // Fetch and store ETH and MATIC prices every 5 minutes
  @Cron('*/5 * * * *')
  async handleCron() {
    try {
      // Fetch WETH price on the Ethereum mainnet
      const ethPriceResponse = await Moralis.EvmApi.token.getTokenPrice({
        chain: '0x1',  // Use '0x1' for Ethereum mainnet
        address: '0xC02aaA39b223F0x2170Ed0880ac9A755fd29B2688956BD959F933F8E8D0A0e5C4F27eAD9083C756Cc2', // WETH contract
      });
      
      // Fetch WMATIC price on the Polygon mainnet
      const maticPriceResponse = await Moralis.EvmApi.token.getTokenPrice({
        chain: '0x89', // Use '0x89' for Polygon mainnet
        address: '0xCC42724C6683B7E57334c4E856f4c9965ED682bD', // WMATIC contract
      });

      // Get the price in USD
      const ethPrice = ethPriceResponse.raw?.usdPrice;
      const maticPrice = maticPriceResponse.raw?.usdPrice;

      if (ethPrice === undefined || maticPrice === undefined) {
        throw new Error("Received undefined price for ETH or MATIC");
      }

      // Save the fetched prices to the database
      await this.savePrice('ETH', ethPrice);
      await this.savePrice('MATIC', maticPrice);

      console.log('Prices updated successfully:', { ethPrice, maticPrice });
    } catch (error) {
      console.error('Error fetching token prices:', error.response?.data || error.message);
    }
  }

  // Save price data to the database
  private async savePrice(chain: string, price: number) {
    const newPrice = this.priceRepository.create({ chain, price });
    await this.priceRepository.save(newPrice);
    console.log(`Saved price for ${chain}:`, price);
  }

  // Get prices within the last 24 hours
  async getPricesWithin24Hours(): Promise<Price[]> {
    const date = new Date();
    date.setHours(date.getHours() - 24);

    return this.priceRepository.find({ where: { timestamp: MoreThan(date) }, order: { timestamp: 'ASC' } });
  }
}
