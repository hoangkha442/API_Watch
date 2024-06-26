// src/order/dto/create-order.dto.ts
import { IsNotEmpty, IsString, IsNumber, IsArray, IsEnum, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { orders_status } from '@prisma/client';

class CreateOrderDetailDto {
  @IsNumber()
  product_id: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;
}

class CreatePaymentDetailDto {
  @IsNumber()
  amount: number;

  @IsString()
  payment_method: string;

  @IsString()
  payment_status: string;
}

class CreateShippingDetailDto {
  @IsString()
  shipping_address: string;

  @IsDateString()
  estimated_delivery_date: Date;
}

export class CreateOrderDto {
  @IsNumber()
  company_id: number;

  @IsDateString()
  order_date: Date;

  @IsEnum(orders_status)
  status: orders_status;

  @IsNumber()
  total_amount: number;

  @IsArray()
  productIDs: number[];

  @ValidateNested({ each: true })
  @Type(() => CreateOrderDetailDto)
  details: CreateOrderDetailDto[];

  @ValidateNested()
  @Type(() => CreatePaymentDetailDto)
  paymentDetail: CreatePaymentDetailDto;

  @ValidateNested()
  @Type(() => CreateShippingDetailDto)
  shippingDetail: CreateShippingDetailDto;
}
