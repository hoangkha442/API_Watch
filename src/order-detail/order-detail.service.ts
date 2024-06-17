import {  HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RequestWithUser } from 'src/user/interfaces';

@Injectable()
export class OrderDetailService {
  prisma = new PrismaClient()


  // LẤY CHI TIẾT ĐƠN HÀNG THÔNG QUA ID NGƯỜI DÙNG
  async getOrderDetailsByUserId(userId: number, req: RequestWithUser): Promise<any> {
    return this.prisma.order_details.findMany({
      where: {
        orders: {
          user_id: userId *1,
        },
      },
      include: {
        orders: true, 
        products: true
      },
    });
  }

  async getAllOrder(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
      select: { role: true },
    });
    if (!user || user.role !== 'admin') {
      throw new HttpException("Bạn không có quyền truy cập!", HttpStatus.FORBIDDEN);
    }
    return this.prisma.order_details.findMany({
      include: {
        orders: { // Assuming 'order' is the correct relation name
          include: {
            users: true // Assuming 'user' is the correct relation name
          }
        },
        products: true // Assuming 'product' is the correct relation name
      }
    });
  }

  // LẤY CHI TIẾT ĐƠN HÀNG THÔNG QUA OrderID
  async getOrderDetailsByOrderId(orderId: number): Promise<any> {
    return this.prisma.order_details.findMany({
      where: {
        order_id: orderId*1,
      },
      include: {
        orders: true,
        products: true
      },
    });
  }

}
