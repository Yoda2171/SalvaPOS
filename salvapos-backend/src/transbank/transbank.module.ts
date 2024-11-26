import { Module } from '@nestjs/common';
import { TransbankService } from './transbank.service';
import { TransbankController } from './transbank.controller';

@Module({
  providers: [TransbankService],
  controllers: [TransbankController],
})
export class TransbankModule {}
