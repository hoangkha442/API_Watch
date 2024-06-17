import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { orders_status } from '@prisma/client';

export class UpdateOrderStatusDto {
  @ApiProperty({ description: 'New status of the order', enum: orders_status })
  @IsEnum(orders_status)
  status: orders_status;
}
