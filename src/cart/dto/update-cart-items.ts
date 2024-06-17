// dto/update-cart-items.dto.ts
import { IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateCartItemDto {
  @IsInt()
  cart_id: number;

  @IsInt()
  quantity: number;
}

export class UpdateCartItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCartItemDto)
  items: UpdateCartItemDto[];
}
