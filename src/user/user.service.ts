import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaClient, users } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { updateUserDto, updateUserRole } from './dto/update-user.dto';
import { RequestWithUser } from './interfaces';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  prisma = new PrismaClient();
  constructor(private jwtService: JwtService) {}

  // Check admin role
  async checkAdminRole(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
      select: { role: true },
    });
    if (!user || user.role !== 'admin') {
      throw new HttpException("Bạn không có quyền truy cập!", HttpStatus.FORBIDDEN);
    }
  }

  // Get user info by token
  async getMyInfoByToken(requestingUserID: number): Promise<users> {
    const user = await this.prisma.users.findUnique({
      where: { user_id: requestingUserID },
    });

    if (!user) {
      throw new HttpException('Không tìm thấy tài khoản', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  // Pagination
  async pagination(page: number, pageSize: number, userId: number): Promise<{ data: users[], totalPage: number }> {
    await this.checkAdminRole(userId);

    const skipCount = (page - 1) * pageSize;
    const data = await this.prisma.users.findMany({
      where: { role: 'customer' },
      skip: skipCount,
      take: pageSize,
      orderBy: [
        { is_visible: 'desc' }, // Sort by visibility first
        { creation_date: 'desc' }, // Then by creation date
      ],
    });
    const totalUsers = await this.prisma.users.count({
      where: { role: 'customer' },
    });
    const totalPage = Math.ceil(totalUsers / pageSize);

    return { data, totalPage };
  }

  async paginationAdmin(page: number, pageSize: number, userId: number): Promise<{ data: users[], totalPage: number }> {
    await this.checkAdminRole(userId);
  
    const skipCount = (page - 1) * pageSize;
    const data = await this.prisma.users.findMany({
      where: { role: 'admin' },
      skip: skipCount,
      take: pageSize,
      orderBy: [
        { is_visible: 'desc' }, // Sort by visibility first
        { creation_date: 'desc' }, // Then by creation date
      ],
    });
    
    const totalUsers = await this.prisma.users.count({
      where: { role: 'admin' },
    });
  
    const totalPage = Math.ceil(totalUsers / pageSize);
  
    return { data, totalPage };
  }
  

  // Create user
  async create(createUserDto: CreateUserDto, userId: number) {
    await this.checkAdminRole(userId);
    const emailExists = await this.prisma.users.findUnique({
      where: { email: createUserDto.email }
    });
    if (emailExists) {
      throw new HttpException('Email đã tồn tại!', HttpStatus.BAD_REQUEST);
    }
    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    return this.prisma.users.create({
      data: createUserDto
    });
  }  

  // Get all users
  async findAll(userId: number): Promise<users[]> {
    await this.checkAdminRole(userId);
    return await this.prisma.users.findMany({ 
      orderBy: [
        { is_visible: 'desc' },
        { creation_date: 'desc' },
      ],});
  }

  // Find user by name
  async findName(uName: string, userId: number){
    await this.checkAdminRole(userId);
    let data = await this.prisma.users.findMany({
      where: { 
        full_name: {
          contains: uName
        }
      },
      orderBy: [
        { is_visible: 'desc' },
        { creation_date: 'desc' },
      ],
    });
    return data;
  }

  // Get user information
  async getMyInfo(userId: number): Promise<any> {
    const getUser = await this.prisma.users.findFirst({
      where:{
        user_id: userId
      }
    });
    return getUser;
  }

  // Find user by ID
  async findOne(id: number) {
    const getUser = await this.prisma.users.findUnique({
      where:{
        user_id: id
      }
    });
    if(!getUser){
      return 'Không tìm thấy người dùng!';
    }
    return getUser;
  }

  

  // Update user
  async update(id: number, updateUserDto: updateUserDto) {
    const userExists = await this.prisma.users.findUnique({
      where: { user_id: id }
    });
    if (!userExists) {
      return `Không tìm thấy tài khoản!`;
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.prisma.users.update({
      where: { user_id: id },
      data: updateUserDto
    });
    return 'Cập nhật thành công!';
  }

  // Update user role by admin
  async updateUserByAdmin(id: number, updateUserRole: updateUserRole, userId: number) {
    await this.checkAdminRole(userId);

    await this.prisma.users.update({
      where: { user_id: id },
      data: {
        ...updateUserRole,
      },
    });
    return "Cập nhật thông tin thành công!"
  }

  // Hide user
  async hidden(id: number, userId: number) {
    await this.checkAdminRole(userId);
    const userToBeHidden = await this.prisma.users.findUnique({
      where: { user_id: id },
      select: { is_visible: true }
    });
  
    if (!userToBeHidden) {
      throw new HttpException("Không tìm thấy người dùng!", HttpStatus.NOT_FOUND);
    }
  
    await this.prisma.users.update({
      where: { user_id: id },
      data: { is_visible: !userToBeHidden.is_visible }
    });
  
    return userToBeHidden.is_visible ? 'Ẩn người dùng thành công!' : 'Hủy ẩn người dùng thành công!';
  }

  // Delete user
  async remove(id: number, requestingUserID: number){
    if (requestingUserID === id) {
      throw new HttpException("Bạn không thể xóa tài khoản của chính mình!", HttpStatus.BAD_REQUEST);
    }

    const requestingUser = await this.prisma.users.findUnique({
      where: { user_id: requestingUserID },
      select: { role: true }
    });
  
    if (requestingUser?.role !== 'admin') {
      throw new HttpException("Bạn không có quyền truy cập!", HttpStatus.FORBIDDEN);
    }

    try {
      await this.prisma.users.delete({
        where: { user_id: id }
      });
      return `User deleted successfully.`;
    } catch (error) {
      if (error.code === 'P2025') { 
        throw new HttpException("Không tìm thấy người dùng cần xóa!", HttpStatus.NOT_FOUND);
      }
      throw error;
    }
  }
  
  // Upload avatar
  async uploadAvatar(file: Express.Multer.File, req: RequestWithUser) {
    const userId = req.user.data.userID;

    if (!file) {
      throw new HttpException('File upload failed.', HttpStatus.BAD_REQUEST);
    }

    const userExists = await this.prisma.users.findUnique({
      where: { user_id: userId }
    });

    if (!userExists) {
      throw new HttpException('Không tìm thấy tài khoản', HttpStatus.NOT_FOUND);
    }

    await this.prisma.users.update({
      where: { user_id: userId },
      data: { avatar: file.filename }
    });

    return 'Thay đổi ảnh đại diện thành công!';
  }

  async updateAvatar(file: Express.Multer.File, req: RequestWithUser) {
    const requestingUserID = req.user.data.userID;

    const userExists = await this.prisma.users.findUnique({
      where: { user_id: requestingUserID}
    });
    if (!userExists) {
      return 'Người dùng không tồn tại!';
    }

    await this.prisma.users.update({
      where: { user_id: requestingUserID },
      data: { avatar: file.filename }
    });

    return 'Tải ảnh đại diện thành công!';
  }
}
