import { HttpException, HttpStatus, Injectable, Body } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient, users } from '@prisma/client';
import { bodyLogin } from './dto/login.dto';
import { bodySignup } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { ResetPasswordDto, NewPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
    prisma = new PrismaClient()
    constructor(
        private jwtService: JwtService,
    ){}

    async login(bodyLogin: bodyLogin) { 
        const getUser = await this.prisma.users.findUnique({
          where: { email: bodyLogin.email }
        });
        if (!getUser) {
          throw new HttpException('Sai Email!', HttpStatus.BAD_REQUEST);
        }
        //
        const isPasswordMatching = await bcrypt.compare(bodyLogin.password, getUser.password);
        if (!isPasswordMatching) {
          throw new HttpException("Sai mật khẩu!", HttpStatus.BAD_REQUEST);
        }
        try {
          const token = await this.jwtService.signAsync(
            { data: { userID: getUser.user_id } }, 
            { expiresIn: "10d", secret: "KHONG_CO_KHOA" }
          );
          return { token: token, 'role': getUser.role };
        } catch (error) {
          throw new HttpException('Lỗi khi tạo token', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }

    async signup(@Body() bodySignup: bodySignup) {
        const checkEmail = await this.prisma.users.findUnique({
            where: { email: bodySignup.email}
        })
        if(!checkEmail){
            let newPassword =  await bcrypt.hash(bodySignup.password, 10);
            const newUser = await this.prisma.users.create({
                data: {
                    ...bodySignup,
                    role: "customer",
                    password: newPassword
                }
            })
            return newUser
        }
        throw new HttpException('Email đã tồn tại!', HttpStatus.BAD_REQUEST)
    }

    async sendResetPasswordEmail(resetPasswordDto: ResetPasswordDto) {
      const user = await this.prisma.users.findUnique({
          where: { email: resetPasswordDto.email }
      });

      if (!user) {
          throw new HttpException('Email không tồn tại!', HttpStatus.BAD_REQUEST);
      }

      const token = await this.jwtService.signAsync(
          { data: { userID: user.user_id } }, 
          { expiresIn: '1h', secret: 'KHONG_CO_KHOA' }
      );

      const transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
              user: 'hoangkha020202@gmail.com',
              pass: 'xrfwcyhaidmnexyz',
          },
      });

      const mailOptions = {
          from: 'hoangkha020202@gmail.com',
          to: resetPasswordDto.email,
          subject: 'Password Reset',
          text: `Click on the following link to reset your password: http://localhost:3000/reset-password?token=${token}`,
      };


      try {
          const info = await transporter.sendMail(mailOptions);
          return { message: 'Password reset email sent' };
      } catch (error) {
          console.error('Error sending email: ', error);
          throw new HttpException('Error sending email', HttpStatus.INTERNAL_SERVER_ERROR);
      }
  }

  async resetPassword(newPasswordDto: NewPasswordDto) {
      const payload = await this.jwtService.verifyAsync(newPasswordDto.token, { secret: 'KHONG_CO_KHOA' });
      const userId = payload.data.userID;

      const newPassword = await bcrypt.hash(newPasswordDto.newPassword, 10);

      await this.prisma.users.update({
          where: { user_id: userId },
          data: { password: newPassword },
      });

      return { message: 'Password reset successfully' };
  }
}
