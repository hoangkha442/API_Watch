import { Controller, Get, Post, Body, Req, Param, Delete, UseGuards, Put, Query, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import {  updateUserDto, updateUserRole } from './dto/update-user.dto';
import { users } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RequestWithUser } from './interfaces';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@ApiTags('QuanLyNguoiDung')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //  PAGINATION USER
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('pagination')
  @ApiQuery({ name: 'page', type: Number, required: true, description: 'Page number for pagination' })
  @ApiQuery({ name: 'pageSize', type: Number, required: true, description: 'Number of items per page' })
  pagination(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Req() req: RequestWithUser
  ) {
    const userId = req.user.data.userID;
    const pageNumber = parseInt(page, 10) || 1;
    const sizePage = parseInt(pageSize, 10) || 10;
    return this.userService.pagination(pageNumber, sizePage, userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('pagination-admin')
  @ApiQuery({ name: 'page', type: Number, required: true, description: 'Page number for pagination' })
  @ApiQuery({ name: 'pageSize', type: Number, required: true, description: 'Number of items per page' })
  paginationAdmin(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Req() req: RequestWithUser
  ) {
    const userId = req.user.data.userID;
    const pageNumber = parseInt(page, 10) || 1;
    const sizePage = parseInt(pageSize, 10) || 10;
    return this.userService.paginationAdmin(pageNumber, sizePage, userId);
  }
    
  // CREATE USER
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Post()
  create(@Body() createUserDto: CreateUserDto, @Req() req: RequestWithUser) {
    const userId = req.user.data.userID;
    return this.userService.create(createUserDto, userId);
  }

  // FIND ALL USERS
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Get()
  findAll(@Req() req: RequestWithUser): Promise<users[]>  {
    const userId = req.user.data.userID;
    return this.userService.findAll(userId);
  }

  // SEARCH USER
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Get('search/:uName')
  findName(@Param('uName') uName: string, @Req() req: RequestWithUser){
    const userId = req.user.data.userID;
    return this.userService.findName(uName, userId)
  }
  
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('my-info')
  async getMyInfoByToken(@Req() req: RequestWithUser) {
    const userId = req.user.data.userID;
    return this.userService.getUserById(userId);
  }

  // FIND USER BY ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  

  // UPDATE USER
  @Put('update-user/:id')
  update(@Param('id') id: number, @Body() updateUserDto: updateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  // Update authorization by admin
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Put('update-authorization/:id')
  updateUserByAdmin(@Param('id') id: number, @Body() updateUserRole: updateUserRole, @Req() req: RequestWithUser) {
      const userId = req.user.data.userID;
      return this.userService.updateUserByAdmin(id, updateUserRole, userId);
  }


  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Put('hidden-user/:id')
  hidden(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.data.userID;
    return this.userService.hidden(+id, userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.data.userID;
    return this.userService.remove(+id, userId);
  }

  
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @UseInterceptors(FileInterceptor("avatar", {
    storage: diskStorage({
      destination: process.cwd() + '/public/img/avatar',
      filename: (req, file, callback) => { 
        callback(null, new Date().getTime() + '_' + file.originalname);
      }
    }) 
  }))
  @Post('upload')
  uploadAvatar(@UploadedFile() file : Express.Multer.File, @Req() req: RequestWithUser){
    return this.userService.uploadAvatar(file, req)
  }
}