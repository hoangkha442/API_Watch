import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';

@Injectable()
export class ProductImagesService {
  prisma = new PrismaClient();

  async create(createProductImageDto: CreateProductImageDto) {
    return await this.prisma.product_images.create({
      data: createProductImageDto,
    });
  }

  async findAll() {
    return await this.prisma.product_images.findMany();
  }

  async findOne(id: number) {
    const productImage = await this.prisma.product_images.findUnique({
      where: { image_id: id },
    });
    if (!productImage) {
      throw new HttpException(`Product image with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }
    return productImage;
  }

  async update(id: number, updateProductImageDto: UpdateProductImageDto) {
    const existingImage = await this.prisma.product_images.findUnique({
      where: { image_id: id },
    });

    if (!existingImage) {
      throw new HttpException(`Product image with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }

    return await this.prisma.product_images.update({
      where: { image_id: id },
      data: updateProductImageDto,
    });
  }

  async remove(id: number) {
    const existingImage = await this.prisma.product_images.findUnique({
      where: { image_id: id },
    });

    if (!existingImage) {
      throw new HttpException(`Product image with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }

    return await this.prisma.product_images.delete({
      where: { image_id: id },
    });
  }

  async findByProductId(productId: number) {
    return this.prisma.product_images.findMany({
      where: { product_id: productId },
    });
  }
}
