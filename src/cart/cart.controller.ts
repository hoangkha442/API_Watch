import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, Put } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from 'src/user/interfaces';
import { UpdateCartItemsDto } from './dto/update-cart-items';
import { DeleteCartItemsDto } from './dto/delete-cart-items.dto';

@ApiTags('GioHang')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // THÊM SẢN PHẨM VÀO GIỎ HÀNG
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Post()
  addToCart(@Body() createCartDto: CreateCartDto, @Req() req: RequestWithUser) {
    return this.cartService.addToCart(createCartDto, req);
  }

  // LẤY GIỎ HÀNG CỦA NGƯỜI DÙNG
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Get()
  getUserCart(@Req() req: RequestWithUser) {
    return this.cartService.getUserCart(req);
  }

  // CẬP NHẬT SỐ LƯỢNG SẢN PHẨM TRONG GIỎ HÀNG
  // @ApiBearerAuth()
  // @UseGuards(AuthGuard("jwt"))
  // @Put(':id')
  // updateCart(@Param('id') id: number, @Body() updateCartDto: UpdateCartDto, @Req() req: RequestWithUser) {
  //   return this.cartService.updateCart(id, updateCartDto, req);
  // }

  // XÓA SẢN PHẨM KHỎI GIỎ HÀNG
  // @ApiBearerAuth()
  // @UseGuards(AuthGuard("jwt"))
  // @Delete(':id')
  // removeFromCart(@Param('id') id: number, @Req() req: RequestWithUser) {
  //   return this.cartService.removeFromCart(id, req);
  // }

  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Get('user')
  getUserCartByUserId(@Req() req: RequestWithUser) {
    const userId = req.user.data.userID;
    return this.cartService.getUserCartByUserId(userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Put('update-multiple')
  updateMultipleCartItems(@Body() updateCartItemsDto: UpdateCartItemsDto, @Req() req: RequestWithUser) {
    return this.cartService.updateMultipleCartItems(updateCartItemsDto.items, req);
  }


  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Delete('delete-multiple')
  deleteMultipleCartItems(@Body() deleteCartItemsDto: DeleteCartItemsDto, @Req() req: RequestWithUser) {
    return this.cartService.deleteMultipleCartItems(deleteCartItemsDto.items, req);
  }
}
