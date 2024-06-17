import { Controller, Get, Post, Body, Param, Delete, Query, Req, UseGuards, Put, UseInterceptors, UploadedFiles, HttpException, HttpStatus } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from 'src/user/interfaces';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@ApiTags('QuanLySanPham')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get('/get-product/:id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Get('pagination')
  @ApiQuery({ name: 'page', type: Number, required: true, description: 'Page number for pagination' })
  @ApiQuery({ name: 'pageSize', type: Number, required: true, description: 'Number of items per page' })
  getPagination(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const sizePage = parseInt(pageSize, 10) || 10;
    return this.productService.getPagination(pageNumber, sizePage);
  }

  @Get('/search/:prdName')
  productName(@Param('prdName') prdName: string) {
    return this.productService.productName(prdName);
  }

  @Get('/top-selling')
  getTopSellingProducts() {
    return this.productService.getTopSellingProducts();
  }

  @Get('/related-products/:id')
  findRelatedProducts(@Param('id') id: string) {
    return this.productService.findRelatedProducts(+id);
  }

  @Get('/popular')
  getPopularProducts() {
    return this.productService.getPopularProducts();
  }

  @Get('/top-promotions')
  getTopPromotionalProducts() {
    return this.productService.getTopPromotionalProducts();
  }

  @Get('/new-products')
  getNewProducts() {
    return this.productService.getNewProducts();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Post()
  @UseInterceptors(FilesInterceptor('product_picture', 10, {
    storage: diskStorage({
      destination: process.cwd() + '/public/img/prds',
      filename: (req, file, callback) => { 
        callback(null, new Date().getTime() + '_' + file.originalname);
      }
    })
  }))
  create(
    @Body() createProductDto: CreateProductDto, 
    @UploadedFiles() files: Express.Multer.File[], 
    @Req() req: RequestWithUser) {
    const userId = req.user.data.userID;
    return this.productService.create(createProductDto, files, userId);
  }

  @Put(':id')
  @UseInterceptors(FilesInterceptor('product_pictures', 10, {
    storage: diskStorage({
      destination: process.cwd() + '/public/img/prds',
      filename: (req, file, callback) => { 
        callback(null, new Date().getTime() + '_' + file.originalname);
      }
    })
  }))
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      throw new HttpException('Invalid product ID', HttpStatus.BAD_REQUEST);
    }
    await this.productService.updateProduct(productId, updateProductDto);

    if (files && files.length > 0) {
      await this.productService.updateProductPictures(productId, files);
    }

    return { message: 'Cập nhật sản phẩm thành công!' };
  }
0
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Put('hidden-product/:id')
  hidden(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.data.userID;
    return this.productService.hidden(+id, userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.data.userID;
    return this.productService.remove(+id, userId);
  }
}
