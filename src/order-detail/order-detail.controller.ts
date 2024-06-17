import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { OrderDetailService } from './order-detail.service';
import { UpdateOrderDetailDto } from './dto/update-order-detail.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from 'src/user/interfaces';

@ApiTags('ChiTietDonHang')
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller('order-detail')
export class OrderDetailController {
  constructor(private readonly orderDetailService: OrderDetailService) {}


  // LẤY CHI TIẾT ĐƠN HÀNG THÔNG QUA ID NGƯỜI DÙNG
  @Get('/user/:userId')
  @HttpCode(HttpStatus.OK)
  async getOrderDetailsByUserId(@Param('userId') userId: number, @Req() req: RequestWithUser): Promise<any> {
    return this.orderDetailService.getOrderDetailsByUserId(userId, req);
  }

  // LẤY CHI TIẾT ĐƠN HÀNG THÔNG QUA OrderID
  @Get('/:orderId')
  @HttpCode(HttpStatus.OK)
  async getOrderDetailsByOrderId(@Param('orderId') orderId: number): Promise<any> {
    return this.orderDetailService.getOrderDetailsByOrderId(orderId);
  }

  // LẤY CHI TIẾT ĐƠN HÀNG THÔNG QUA OrderID
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllOrder(@Req() req: RequestWithUser){
    const userId = req.user.data.userID;
    return this.orderDetailService.getAllOrder(userId);
  }
}
