import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaClient } from '@prisma/client';
import { RequestWithUser } from 'src/user/interfaces';

@Injectable()
export class ReviewService {
  prisma = new PrismaClient();

  async createReview(dto: CreateReviewDto, req: RequestWithUser) {
    const requestingUserID = req.user.data.userID;
    dto.user_id = requestingUserID;
    return this.prisma.reviews.create({ data: dto });
  }

  async getReviewsByProductId(productId: number) {
    return this.prisma.reviews.findMany({
      where: {
        product_id: productId * 1,
      },
      include: {
        users: true
      },
      orderBy: {
        review_date: 'desc'  
      }
    });
  }

  async updateReview(id: number, dto: UpdateReviewDto, req: RequestWithUser) {
    const requestingUserID = req.user.data.userID;
    const review = await this.prisma.reviews.findUnique({
      where: {
        review_id: id * 1,
      },
    });
    if (!review) {
      throw new NotFoundException(`Không tìm thấy đánh giá!`);
    }
    if (review.user_id !== requestingUserID) {
      throw new UnauthorizedException(`Bạn không có quyền đánh giá sản phẩm!.`);
    }
    return this.prisma.reviews.update({
      where: { review_id: id * 1},
      data: dto,
    });
  }

  async deleteReview(id: number, req: RequestWithUser) {
    const requestingUserID = req.user.data.userID;
    const requestingUser = await this.prisma.users.findUnique({
      where: { user_id: requestingUserID },
      select: { role: true }
    });
    if (!requestingUser || requestingUser.role !== 'admin') {
      throw new HttpException("Bạn không có quyền truy cập!", HttpStatus.FORBIDDEN);
    }
    await this.prisma.reviews.delete({ where: { review_id: id * 1} });
    return 'Xóa bình luận thành công!'
  }
}
