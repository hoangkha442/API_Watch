import { Injectable } from '@nestjs/common';
import { UpdatePaymentDetailDto } from './dto/update-payment-detail.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PaymentDetailService {
  prisma = new PrismaClient()

  async findAll(){
    return await this.prisma.payment_details.findMany({
      include: {
        orders: {
          include: {
            users: true
          }
        }
      }
    })
  }

  async findOne(id: number) {
    return this.prisma.payment_details.findUnique({
      where: { payment_id: id },
      include: {
        orders: {
          include: {
            users: true
          }
        }
      }
    });
  }

}
