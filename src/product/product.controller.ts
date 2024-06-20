import { Controller, Get, Post, Body, Param, Delete, Put, UploadedFiles, UseGuards, HttpException, HttpStatus, UseInterceptors, Req, Query, UploadedFile } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequestWithUser } from 'src/user/interfaces';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll() {
    return this.productService.findAll();
  }

  @Get('/get-product/:id')
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Get('pagination')
  async getPagination(@Query('page') page: string, @Query('pageSize') pageSize: string) {
    const pageNumber = parseInt(page, 10) || 1;
    const sizePage = parseInt(pageSize, 10) || 10;
    return this.productService.getPagination(pageNumber, sizePage);
  }

  @Get('/search/:prdName')
  async productName(@Param('prdName') prdName: string) {
    return this.productService.productName(prdName);
  }

  @Get('/top-selling')
  async getTopSellingProducts() {
    return this.productService.getTopSellingProducts();
  }

  @Get('/related-products/:id')
  async findRelatedProducts(@Param('id') id: string) {
    return this.productService.findRelatedProducts(+id);
  }

  @Get('/popular')
  async getPopularProducts() {
    return this.productService.getPopularProducts();
  }

  @Get('/top-promotions')
  async getTopPromotionalProducts() {
    return this.productService.getTopPromotionalProducts();
  }

  @Get('/new-products')
  async getNewProducts() {
    return this.productService.getNewProducts();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UseInterceptors(FilesInterceptor('product_picture', 10, {
    storage: diskStorage({
      destination: process.cwd() + '/public/img/prds',
      filename: (req, file, callback) => {
        callback(null, `${Date.now()}_${file.originalname}`);
      },
    }),
  }))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.data.userID;
    return this.productService.create(createProductDto, files, userId);
  }

  // New endpoint to handle image uploads separately
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('/picture')
  @UseInterceptors(FilesInterceptor('product_picture', 10, {
    storage: diskStorage({
      destination: process.cwd() + '/public/img/prds',
      filename: (req, file, callback) => {
        callback(null, `${Date.now()}_${file.originalname}`);
      },
    }),
  }))
  async uploadPictures(
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new HttpException('No files uploaded', HttpStatus.BAD_REQUEST);
    }
    return this.productService.uploadProductPictures(files);
  }

  @Put(':id')
  @UseInterceptors(FilesInterceptor('product_picture', 10, {
    storage: diskStorage({
      destination: process.cwd() + '/public/img/prds',
      filename: (req, file, callback) => {
        callback(null, `${Date.now()}_${file.originalname}`);
      },
    }),
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
      await this.productService.uploadProductPictures(files);
    }

    return { message: 'Cập nhật sản phẩm thành công!' };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put('hidden-product/:id')
  async hidden(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.data.userID;
    return this.productService.hidden(+id, userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.data.userID;
    return this.productService.remove(+id, userId);
  }
}
