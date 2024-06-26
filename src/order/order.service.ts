import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient, orders_status } from '@prisma/client';
import { RequestWithUser } from 'src/user/interfaces';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CreateMultipleOrdersDto } from './dto/create-multiple-orders.dto';


@Injectable()
export class OrderService {
  prisma = new PrismaClient()

  // TẠO ĐƠN HÀNG + CHI TIẾT ĐƠN HÀNG
  // async createOrderAndDetails(orderData: CreateOrderDto, req: RequestWithUser) {
  //   const requestingUserID = req.user.data.userID;
  //   if(!requestingUserID){
  //     throw new HttpException("Bạn chưa đăng nhập!", HttpStatus.FORBIDDEN);
  //   }
  //   await this.prisma.orders.create({
  //     data: {
  //       user_id: requestingUserID,
  //       company_id: orderData.company_id,
  //       order_date: new Date(orderData.order_date),
  //       status: orderData.status,
  //       total_amount: orderData.total_amount,
  //       order_details: {
  //         create: orderData.details,
  //       },
  //       payment_details: {
  //         create: orderData.paymentDetail,
  //       },
  //       shipping_details: {
  //         create: orderData.shippingDetail,
  //       },
  //     },
  //   });
  //   return "Đặt hàng thành công!"
  // }

  async findAllOrder(userId: number){
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
      select: { role: true },
    });
    if (!user || user.role !== 'admin') {
      throw new HttpException("Bạn không có quyền truy cập!", HttpStatus.FORBIDDEN);
    }
    return this.prisma.orders.findMany({
      include: {
        users: true
      }
    })
  }

  // PAGINATION ORDERS ADMIN
  async findAll(req: RequestWithUser, page: number, pageSize: number) {
    const requestingUserID = req.user.data.userID;
    if(!requestingUserID){
      throw new HttpException("Bạn chưa đăng nhập!", HttpStatus.FORBIDDEN);
    }
    const skipCount = (page - 1) * pageSize;
    const order = await this.prisma.orders.findMany({
      skip: skipCount,
      take: pageSize,
      include: {
        users: true
      }
    });
    const totalOrders = await this.prisma.orders.count();
    const totalPage = Math.ceil(totalOrders / pageSize);
    return { data: order, totalPage };
  }

  // My ORDER
  async findUserOrder( req: RequestWithUser) {
    const requestingUserID = req.user.data.userID;
    if(!requestingUserID){
      throw new HttpException("Bạn chưa đăng nhập!", HttpStatus.FORBIDDEN);
    }
    return await this.prisma.orders.findMany({
      where: {
        user_id: requestingUserID,
      },
      include: {
        users: true,
      }
    });
  }



  // UPDATE ORDER STATUS
  async updateOrderStatus(orderId: number, updateOrderStatusDto: UpdateOrderStatusDto, req: RequestWithUser): Promise<any> {
    const requestingUserID = req.user.data.userID;
  
    const requestingUser = await this.prisma.users.findUnique({
      where: { user_id: requestingUserID },
      select: { role: true }
    });
  
    if (!requestingUser) {
      throw new HttpException("Bạn không có quyền truy cập!", HttpStatus.FORBIDDEN);
    }
    return this.prisma.orders.update({
      where: { order_id: orderId *1 },
      data: { status: updateOrderStatusDto.status},
    });
  }

  async createMultipleOrders(orderData: CreateMultipleOrdersDto, req: RequestWithUser) {
    const requestingUserID = req.user.data.userID;
    if (!requestingUserID) {
      throw new HttpException("Bạn chưa đăng nhập!", HttpStatus.FORBIDDEN);
    }

    const createdOrders = [];
    for (const order of orderData.orders) {
      const productIDs = order.details.map(detail => detail.product_id);

      const createdOrder = await this.prisma.orders.create({
        data: {
          user_id: requestingUserID,
          company_id: order.company_id,
          order_date: new Date(order.order_date),
          status: order.status as orders_status, // Convert status to orders_status enum
          total_amount: order.total_amount,
          productIDs: productIDs,
          order_details: {
            create: order.details,
          },
          payment_details: {
            create: order.paymentDetail,
          },
          shipping_details: {
            create: order.shippingDetail,
          },
        },
      });
      createdOrders.push(createdOrder);
    }

    return { message: "Đặt hàng thành công!", orders: createdOrders };
  }
  
  
}
