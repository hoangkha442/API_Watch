// update-cart.dto.ts
import { IsInt, IsOptional } from 'class-validator';

export class UpdateCartDto {
  @IsInt()
  @IsOptional()
  quantity?: number;
}
