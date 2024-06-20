import { Controller, Get, Post, Body, Param, Delete, Put, UploadedFile, UseInterceptors, HttpException, HttpStatus } from '@nestjs/common';
import { ProductImagesService } from './product-images.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@ApiTags('product-images')
@Controller('product-images')
export class ProductImagesController {
  constructor(private readonly productImagesService: ProductImagesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('product_picture', {
    storage: diskStorage({
      destination: process.cwd() + '/public/img/prds',
      filename: (req, file, callback) => {
        callback(null, `${Date.now()}_${file.originalname}`);
      },
    }),
  }))
  async create(@UploadedFile() file: Express.Multer.File, @Body() createProductImageDto: CreateProductImageDto) {
    createProductImageDto.image_url = file.filename;
    return this.productImagesService.create(createProductImageDto);
  }

  @Get()
  findAll() {
    return this.productImagesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const imageId = parseInt(id, 10);
    if (isNaN(imageId)) {
      throw new HttpException('Invalid image ID', HttpStatus.BAD_REQUEST);
    }
    return this.productImagesService.findOne(imageId);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('product_picture', {
    storage: diskStorage({
      destination: process.cwd() + '/public/img/prds',
      filename: (req, file, callback) => {
        callback(null, `${Date.now()}_${file.originalname}`);
      },
    }),
  }))
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateProductImageDto: UpdateProductImageDto,
  ) {
    const imageId = parseInt(id, 10);
    if (isNaN(imageId)) {
      throw new HttpException('Invalid image ID', HttpStatus.BAD_REQUEST);
    }
    if (file) {
      updateProductImageDto.image_url = file.filename;
    }
    return this.productImagesService.update(imageId, updateProductImageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productImagesService.remove(+id);
  }

  @Get('product/:productId')
  findByProductId(@Param('productId') productId: string) {
    return this.productImagesService.findByProductId(+productId);
  }
}
