// dto/delete-cart-items.dto.ts
import { IsInt, IsArray } from 'class-validator';

class DeleteCartItemDto {
  @IsInt()
  cart_id: number;
}

export class DeleteCartItemsDto {
  @IsArray()
  items: DeleteCartItemDto[];
}
