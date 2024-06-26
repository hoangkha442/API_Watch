  import { Controller, Get, Post,Put, Body, Patch, Param, Delete, UseGuards, Req, Query, HttpCode, HttpStatus } from '@nestjs/common';
  import { OrderService } from './order.service';
  import { CreateOrderDto } from './dto/create-order.dto';
  import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
  import { AuthGuard } from '@nestjs/passport';
  import { RequestWithUser } from 'src/user/interfaces';
  import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CreateMultipleOrdersDto } from './dto/create-multiple-orders.dto';
  @ApiTags('Orders')
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Controller('order')
  export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    
    // @Post()
    // @HttpCode(HttpStatus.CREATED)
    // @ApiResponse({ status: HttpStatus.CREATED, description: 'Order created successfully.' })
    // @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request.' })
    // async createOrder(@Body() orderData: CreateOrderDto, @Req() req: RequestWithUser): Promise<any> {
    //   return this.orderService.createOrderAndDetails(orderData, req);
    // }
  
    @Get()
    findAllOrder(@Req() req: RequestWithUser) {
      const userId = req.user.data.userID;
      return this.orderService.findAllOrder(userId);
    }

    @Get('/pagination')
    @ApiQuery({ name: 'page', type: Number, required: true, description: 'Page number for pagination' })
    @ApiQuery({ name: 'pageSize', type: Number, required: true, description: 'Number of items per page' })
    findAll(@Req() req: RequestWithUser,@Query('page') page: string,
    @Query('pageSize') pageSize: string,) {
      const pageNumber = parseInt(page, 10) || 1;
      const sizePage = parseInt(pageSize, 10) || 10;
      return this.orderService.findAll(req, pageNumber, sizePage);
    }

    @Get('/user')
    findUserOrder( @Req() req: RequestWithUser) {
      return this.orderService.findUserOrder(req);
    }

    @Put(':orderId/status')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: HttpStatus.OK, description: 'Order status updated successfully.' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found.' })
    async updateOrderStatus(@Param('orderId') orderId: number, @Body() updateOrderStatusDto: UpdateOrderStatusDto,  @Req() req: RequestWithUser): Promise<any> {
      return this.orderService.updateOrderStatus(orderId, updateOrderStatusDto, req);
    }

    @Post('create-multiple')
    @HttpCode(HttpStatus.CREATED)
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Orders created successfully.' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request.' })
    async createMultipleOrders(@Body() orderData: CreateMultipleOrdersDto, @Req() req: RequestWithUser): Promise<any> {
      return this.orderService.createMultipleOrders(orderData, req);
    }
  }
