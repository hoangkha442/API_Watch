import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  prisma = new PrismaClient();

  async checkAdminRole(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
      select: { role: true },
    });
    if (!user || user.role !== 'admin') {
      throw new HttpException("Bạn không có quyền truy cập!", HttpStatus.FORBIDDEN);
    }
  }

  async findAll() {
    return await this.prisma.products.findMany({
      orderBy: {
        creation_date: 'desc',
      },
    });
  }

  async getPagination(page: number, pageSize: number) {
    const skipCount = (page - 1) * pageSize;
    const products = await this.prisma.products.findMany({
      skip: skipCount,
      take: pageSize,
      orderBy: {
        creation_date: 'desc',
      },
    });
    const totalProducts = await this.prisma.products.count();
    const totalPage = Math.ceil(totalProducts / pageSize);
    return { data: products, totalPage };
  }

  async productName(prdName: string) {
    return await this.prisma.products.findMany({
      where: {
        product_name: {
          contains: prdName,
        },
      },
    });
  }

  async getTopSellingProducts() {
    return await this.prisma.products.findMany({
      orderBy: {
        quantity_sold: 'desc',
      },
      take: 5,
    });
  }

  async findRelatedProducts(productId: number) {
    const product = await this.prisma.products.findUnique({
      where: { product_id: productId },
    });

    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    return await this.prisma.products.findMany({
      where: {
        OR: [
          { category_id: product.category_id },
          { supplier_id: product.supplier_id },
        ],
        AND: { product_id: { not: productId } },
      },
      take: 6,
    });
  }

  async getPopularProducts() {
    return await this.prisma.products.findMany({
      orderBy: {
        popularity_score: 'desc',
      },
      take: 10,
    });
  }

  async getTopPromotionalProducts() {
    return await this.prisma.products.findMany({
      where: {
        promotion_percentage: {
          gt: 0,
        },
      },
      orderBy: {
        promotion_percentage: 'desc',
      },
      take: 10,
    });
  }

  async getNewProducts() {
    return await this.prisma.products.findMany({
      orderBy: {
        creation_date: 'desc',
      },
      take: 10,
    });
  }

  async findOne(id: number) {
    return await this.prisma.products.findMany({
      where: {
        product_id: id,
      },
      include: {
        product_categories: true,
        suppliers: true,
        product_images: true,
      },
    });
  }

  async create(createProductDto: CreateProductDto, files: Express.Multer.File[], userId: number) {
    await this.checkAdminRole(userId);

    const product = await this.prisma.products.create({
      data: {
        product_name: createProductDto.product_name,
        description: createProductDto.description,
        price: createProductDto.price * 1,
        quantity_in_stock: createProductDto.quantity_in_stock * 1,
        category_id: createProductDto.category_id * 1,
        supplier_id: createProductDto.supplier_id * 1,
      },
    });

    if (files && files.length > 0) {
      for (const file of files) {
        await this.prisma.product_images.create({
          data: {
            product_id: product.product_id,
            image_url: file.filename,
          },
        });
      }
    }
    return 'Thêm sản phẩm thành công!';
  }

  async updateProduct(productId: number, updateProductDto: UpdateProductDto) {
    const existingProduct = await this.prisma.products.findUnique({
      where: { product_id: productId },
    });

    if (!existingProduct) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    const { image_urls, ...productData } = updateProductDto;

    const updatedProduct = await this.prisma.products.update({
      where: { product_id: productId },
      data: productData,
    });

    if (image_urls && image_urls.length > 0) {
      await this.prisma.product_images.deleteMany({
        where: { product_id: productId },
      });

      for (const url of image_urls) {
        await this.prisma.product_images.create({
          data: {
            product_id: productId,
            image_url: url,
          },
        });
      }
    }

    return updatedProduct;
  }

  // Method to upload images separately
  async uploadProductPictures(files: Express.Multer.File[]) {
    for (const file of files) {
      await this.prisma.product_images.create({
        data: {
          product_id: null, // Handle associating these images with a product later
          image_url: file.filename,
        },
      });
    }
    return 'Images uploaded successfully!';
  }

  async updateProductPictures(productId: number, files: Express.Multer.File[]) {
    if (files && files.length > 0) {
      await this.prisma.product_images.deleteMany({
        where: { product_id: productId },
      });

      for (const file of files) {
        await this.prisma.product_images.create({
          data: {
            product_id: productId,
            image_url: file.filename,
          },
        });
      }
    }
    return 'Cập nhật hình ảnh sản phẩm thành công!';
  }

  async hidden(id: number, userId: number) {
    await this.checkAdminRole(userId);
    const productToBeHidden = await this.prisma.products.findUnique({
      where: { product_id: id },
      select: { is_visible: true },
    });

    if (!productToBeHidden) {
      throw new HttpException("Không tìm thấy sản phẩm!", HttpStatus.NOT_FOUND);
    }

    await this.prisma.products.update({
      where: { product_id: id },
      data: { is_visible: !productToBeHidden.is_visible },
    });

    return productToBeHidden.is_visible ? 'Ẩn sản phẩm thành công!' : 'Hủy ẩn sản phẩm thành công!';
  }

  async remove(id: number, userId: number) {
    await this.checkAdminRole(userId);

    try {
      await this.prisma.products.delete({
        where: { product_id: id },
      });
      return `Đã xóa sản phẩm thành công.`;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException("Không tìm thấy sản phẩm cần xóa!", HttpStatus.NOT_FOUND);
      }
      throw error;
    }
  }
}
