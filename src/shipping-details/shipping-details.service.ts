import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ShippingDetailsService {
  prisma = new PrismaClient()
 

  async findOne(id: number) {
    return this.prisma.shipping_details.findUnique({
      where: { shipping_id: id },
    });
  }

  async findAll(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
      select: { role: true },
    });
    if (!user || user.role !== 'admin') {
      throw new HttpException("Bạn không có quyền truy cập!", HttpStatus.FORBIDDEN);
    }
    return this.prisma.shipping_details.findMany();
  }
 
}
