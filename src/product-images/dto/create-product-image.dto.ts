import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateProductImageDto {
  @IsNotEmpty()
  @IsString()
  image_url: string;

  @IsInt()
  product_id: number;
}
