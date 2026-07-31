import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApplicationsModule } from '../applications/applications.module';
import { EmployersModule } from '../employers/employers.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OffersController } from './controllers/offers.controller';
import { Offer, OfferSchema } from './schemas/offer.schema';
import { OffersService } from './services/offers.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Offer.name, schema: OfferSchema }]),
    EmployersModule,
    NotificationsModule,
    forwardRef(() => ApplicationsModule),
  ],
  controllers: [OffersController],
  providers: [OffersService],
})
export class OffersModule {}
