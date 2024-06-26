// dto/create-multiple-orders.dto.ts
import { IsArray, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderDto } from './create-order.dto';
import { orders_status } from '@prisma/client';

export class CreateMultipleOrdersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDto)
  orders: CreateOrderDto[];

  @IsEnum(orders_status)
  status: orders_status;
}
