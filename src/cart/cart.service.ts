import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { PrismaClient } from '@prisma/client';
import { RequestWithUser } from 'src/user/interfaces';
import { UpdateCartItemsDto } from './dto/update-cart-items';
import { DeleteCartItemsDto } from './dto/delete-cart-items.dto';

@Injectable()
export class CartService {
  prisma = new PrismaClient();

  // THÊM SẢN PHẨM VÀO GIỎ HÀNG
  async addToCart(createCartDto: CreateCartDto, req: RequestWithUser) {
    const userId = req.user.data.userID;

    // Check if product exists
    const product = await this.prisma.products.findUnique({
      where: { product_id: createCartDto.product_id },
      
    });

    if (!product) {
      throw new HttpException('Sản phẩm không tồn tại!', HttpStatus.NOT_FOUND);
    }

    // Check if product already in cart
    const existingCartItem = await this.prisma.cart.findFirst({
      where: {
        user_id: userId,
        product_id: createCartDto.product_id,
      },
    });

    if (existingCartItem) {
      // Update quantity if product is already in cart
      await this.prisma.cart.update({
        where: { cart_id: existingCartItem.cart_id },
        data: { quantity: existingCartItem.quantity + (createCartDto.quantity || 1) },
      });
      return 'Cập nhật số lượng sản phẩm trong giỏ hàng thành công!';
    } else {
      // Add new product to cart
      await this.prisma.cart.create({
        data: {
          user_id: userId,
          product_id: createCartDto.product_id,
          quantity: createCartDto.quantity || 1,
          added_date: new Date(),
        },
      });
      return 'Thêm sản phẩm vào giỏ hàng thành công!';
    }
  }

  // LẤY GIỎ HÀNG CỦA NGƯỜI DÙNG
  async getUserCart(req: RequestWithUser) {
    const userId = req.user.data.userID;
    return await this.prisma.cart.findMany({
      where: { user_id: userId },
      include: { products: 
        {
          include: { product_images : true },
        }
       },
    });
  }

  // CẬP NHẬT SỐ LƯỢNG SẢN PHẨM TRONG GIỎ HÀNG
  // async updateCart(id: number, updateCartDto: UpdateCartDto, req: RequestWithUser) {
  //   const userId = req.user.data.userID;

  //   // Check if the cart item exists
  //   const cartItem = await this.prisma.cart.findUnique({
  //     where: { cart_id: id * 1 },
  //   });

  //   if (!cartItem || cartItem.user_id !== userId) {
  //     throw new HttpException('Không tìm thấy sản phẩm trong giỏ hàng!', HttpStatus.NOT_FOUND);
  //   }

  //   // Update cart item quantity
  //   await this.prisma.cart.update({
  //     where: { cart_id: id * 1   },
  //     data: { quantity: updateCartDto.quantity },
  //   });

  //   return 'Cập nhật số lượng sản phẩm trong giỏ hàng thành công!';
  // }

  // XÓA SẢN PHẨM KHỎI GIỎ HÀNG
  // async removeFromCart(id: number, req: RequestWithUser) {
  //   const userId = req.user.data.userID;

  //   // Check if the cart item exists
  //   const cartItem = await this.prisma.cart.findUnique({
  //     where: { cart_id: id },
  //   });

  //   if (!cartItem || cartItem.user_id !== userId) {
  //     throw new HttpException('Không tìm thấy sản phẩm trong giỏ hàng!', HttpStatus.NOT_FOUND);
  //   }

  //   // Delete cart item
  //   await this.prisma.cart.delete({
  //     where: { cart_id: id },
  //   });

  //   return 'Xóa sản phẩm khỏi giỏ hàng thành công!';
  // }


  
  // LẤY GIỎ HÀNG CỦA NGƯỜI DÙNG
  async getUserCartByUserId(userId: number) {
    return await this.prisma.cart.findMany({
      where: { user_id: userId },
      include: {
        products: {
          include: {
            product_images: true, // Include product images
          },
        },
      }
    });
  }

  async updateMultipleCartItems(updateCartItemsDto: UpdateCartItemsDto['items'], req: RequestWithUser) {
    const userId = req.user.data.userID;

    // Check if all items belong to the user
    for (const item of updateCartItemsDto) {
      const cartItem = await this.prisma.cart.findUnique({
        where: { cart_id: item.cart_id },
      });

      if (!cartItem || cartItem.user_id !== userId) {
        throw new HttpException(`Không tìm thấy sản phẩm trong giỏ hàng với id ${item.cart_id}!`, HttpStatus.NOT_FOUND);
      }

      // Update each cart item
      await this.prisma.cart.update({
        where: { cart_id: item.cart_id },
        data: { quantity: item.quantity },
      });
    }

    return 'Cập nhật giỏ hàng thành công!';
  }

  // XÓA NHIỀU SẢN PHẨM TRONG GIỎ HÀNG
  async deleteMultipleCartItems(deleteCartItemsDto: DeleteCartItemsDto['items'], req: RequestWithUser) {
    const userId = req.user.data.userID;

    // Check if all items belong to the user
    for (const item of deleteCartItemsDto) {
      const cartItem = await this.prisma.cart.findUnique({
        where: { cart_id: item.cart_id },
      });

      if (!cartItem || cartItem.user_id !== userId) {
        throw new HttpException(`Không tìm thấy sản phẩm trong giỏ hàng với id ${item.cart_id}!`, HttpStatus.NOT_FOUND);
      }

      // Delete each cart item
      await this.prisma.cart.delete({
        where: { cart_id: item.cart_id },
      });
    }
  }
}
