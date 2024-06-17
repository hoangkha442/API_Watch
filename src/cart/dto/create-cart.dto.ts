import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCartDto {
  @IsInt()
  @IsNotEmpty()
  product_id: number;

  @IsInt()
  @IsOptional()
  quantity?: number;
}