import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategy/jwt.strategy';
import { ProductModule } from './product/product.module';
import { CloudinaryProvider } from './cloudinary.provider';
import { CategoryModule } from './category/category.module';
import { SupplierModule } from './supplier/supplier.module';
import { OrderModule } from './order/order.module';
import { OrderDetailModule } from './order-detail/order-detail.module';
import { ReviewModule } from './review/review.module';
import { InventoryModule } from './inventory/inventory.module';
import { ShippingDetailsModule } from './shipping-details/shipping-details.module';
import { PaymentDetailModule } from './payment-detail/payment-detail.module';
import { CartModule } from './cart/cart.module';
import { ProductImagesModule } from './product-images/product-images.module';

@Module({
  imports: [AuthModule, UserModule, ConfigModule.forRoot({
    isGlobal: true,
  }), ProductModule, CategoryModule, SupplierModule, OrderModule, OrderDetailModule, ReviewModule, InventoryModule, ShippingDetailsModule, PaymentDetailModule, CartModule, ProductImagesModule],
  controllers: [AppController],
  providers: [AppService, JwtStrategy, CloudinaryProvider],
})
export class AppModule {}
